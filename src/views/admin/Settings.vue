<template>
  <div class="settings-page">
    <!-- Header -->
    <div class="page-header">
      <h1 class="page-title">{{ $t('settings.title') }}</h1>
      <p class="page-subtitle">{{ $t('settings.subtitle') }}</p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container glass-card">
      <div class="loading-spinner"></div>
      <p>{{ $t('settings.loadingSettings') }}</p>
    </div>

    <div v-else>
      <!-- Settings Tabs -->
      <div class="settings-tabs glass-card">
        <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id" :class="{ active: activeTab === tab.id }">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="tab.iconPath" /></svg>
          {{ $t(tab.nameKey) }}
        </button>
      </div>

      <!-- General Settings -->
      <div v-if="activeTab === 'general'" class="settings-section">
        <div class="settings-card glass-card">
          <div class="card-header">
            <div class="card-icon"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg></div>
            <h3>{{ $t('settings.general') }}</h3>
          </div>
          <div class="settings-form">
            <div class="form-group"><label>{{ $t('settings.systemName') }}</label><input type="text" v-model="settings.system_name" class="form-input" :placeholder="$t('settings.systemName')"><p class="help-text">{{ $t('settings.systemNameHelp') }}</p></div>
            <div class="form-group"><label>{{ $t('settings.timezone') }}</label><select v-model="settings.timezone" class="form-select"><option value="Africa/Addis_Ababa">Africa/Addis_Ababa (GMT+3)</option><option value="Africa/Nairobi">Africa/Nairobi (GMT+3)</option><option value="Africa/Cairo">Africa/Cairo (GMT+2)</option><option value="UTC">UTC</option><option value="America/New_York">America/New_York (GMT-5)</option><option value="Europe/London">Europe/London (GMT+0)</option><option value="Asia/Dubai">Asia/Dubai (GMT+4)</option></select><p class="help-text">{{ $t('settings.timezoneHelp') }}</p></div>
            <div class="form-group"><label>{{ $t('settings.dateFormat') }}</label><select v-model="settings.date_format" class="form-select"><option value="YYYY-MM-DD">YYYY-MM-DD (2024-01-15)</option><option value="DD/MM/YYYY">DD/MM/YYYY (15/01/2024)</option><option value="MM/DD/YYYY">MM/DD/YYYY (01/15/2024)</option><option value="DD-MM-YYYY">DD-MM-YYYY (15-01-2024)</option></select><p class="help-text">{{ $t('settings.dateFormatHelp') }}</p></div>
            <div class="form-group"><label>{{ $t('settings.currency') }}</label><select v-model="settings.currency" class="form-select"><option value="ETB">{{ $t('settings.currencyETB') }}</option><option value="USD">{{ $t('settings.currencyUSD') }}</option><option value="EUR">{{ $t('settings.currencyEUR') }}</option><option value="GBP">{{ $t('settings.currencyGBP') }}</option></select><p class="help-text">{{ $t('settings.currencyHelp') }}</p></div>
            <div class="form-group"><label>{{ $t('settings.language') }}</label><select v-model="settings.language" class="form-select"><option value="en">English</option><option value="am">አማርኛ (Amharic)</option></select><p class="help-text">{{ $t('settings.languageHelp') }}</p></div>
            <div class="form-group"><label>{{ $t('settings.itemsPerPage') }}</label><input type="number" v-model="settings.items_per_page" min="5" max="100" class="form-input"><p class="help-text">{{ $t('settings.itemsPerPageHelp') }}</p></div>
          </div>
          <div class="form-actions"><button class="btn-primary" @click="saveSettings" :disabled="isSaving"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg> {{ isSaving ? $t('common.saving') : $t('settings.saveSettings') }}</button></div>
        </div>
      </div>

      <!-- Bank Account Management -->
      <div v-if="activeTab === 'bankaccounts'" class="settings-section">
        <div class="settings-card glass-card">
          <div class="card-header">
            <div class="card-icon"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H7a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg></div>
            <h3>{{ $t('settings.bankAccounts') }}</h3>
            <button class="btn-primary-sm" @click="openAddBankAccountModal"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg> {{ $t('settings.addAccount') }}</button>
          </div>
          <div class="bank-accounts-list">
            <div v-if="bankAccounts.length === 0" class="no-data"><svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H7a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg><p>{{ $t('settings.noBankAccounts') }}</p><button class="btn-primary-sm" @click="openAddBankAccountModal">{{ $t('settings.addFirstAccount') }}</button></div>
            <div v-for="account in bankAccounts" :key="account.id" class="bank-account-item">
              <div class="account-info"><div class="account-icon"><svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H7a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg></div><div class="account-details"><div class="account-name">{{ account.bank_name }}</div><div class="account-number">{{ account.account_number }}</div><div class="account-holder">{{ account.account_name }}</div><div class="account-meta"><span class="account-type">{{ account.account_type }}</span><span class="account-currency">{{ account.currency }}</span><span :class="['account-status', account.is_active ? 'active' : 'inactive']">{{ account.is_active ? $t('common.active') : $t('common.inactive') }}</span></div></div></div>
              <div class="account-actions">
                <button class="btn-icon" @click="editBankAccount(account)" :title="$t('common.edit')"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                <button v-if="!account.is_active" class="btn-icon success" @click="activateBankAccount(account)" :title="$t('common.activate')"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg></button>
                <button v-if="account.is_active" class="btn-icon warning" @click="deactivateBankAccount(account)" :title="$t('common.deactivate')"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg></button>
                <button class="btn-icon danger" @click="deleteBankAccount(account)" :title="$t('common.delete')"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Notification Settings -->
      <div v-if="activeTab === 'notifications'" class="settings-section">
        <div class="settings-card glass-card">
          <div class="card-header"><div class="card-icon"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg></div><h3>{{ $t('settings.notifications') }}</h3></div>
          <div class="settings-form">
            <div class="form-group"><label class="checkbox-label"><input type="checkbox" v-model="notificationSettings.low_stock_email"><span>{{ $t('settings.lowStockEmail') }}</span></label><p class="help-text">{{ $t('settings.lowStockEmailHelp') }}</p></div>
            <div class="form-group"><label class="checkbox-label"><input type="checkbox" v-model="notificationSettings.daily_report_email"><span>{{ $t('settings.dailyReport') }}</span></label><p class="help-text">{{ $t('settings.dailyReportHelp') }}</p></div>
            <div class="form-group"><label class="checkbox-label"><input type="checkbox" v-model="notificationSettings.sms_alerts"><span>{{ $t('settings.smsAlerts') }}</span></label><p class="help-text">{{ $t('settings.smsAlertsHelp') }}</p></div>
            <div class="form-group"><label class="checkbox-label"><input type="checkbox" v-model="notificationSettings.loan_overdue_alerts"><span>{{ $t('settings.loanOverdueAlerts') }}</span></label><p class="help-text">{{ $t('settings.loanOverdueAlertsHelp') }}</p></div>
            <div class="form-group"><label>{{ $t('settings.emailRecipients') }}</label><textarea v-model="notificationSettings.email_recipients" rows="3" class="form-textarea" :placeholder="$t('settings.emailRecipientsPlaceholder')"></textarea><p class="help-text">{{ $t('settings.emailRecipientsHelp') }}</p></div>
            <div class="form-group"><label>{{ $t('settings.smsRecipients') }}</label><textarea v-model="notificationSettings.sms_recipients" rows="2" class="form-textarea" :placeholder="$t('settings.smsRecipientsPlaceholder')"></textarea><p class="help-text">{{ $t('settings.smsRecipientsHelp') }}</p></div>
          </div>
          <div class="form-actions"><button class="btn-primary" @click="saveNotificationSettings" :disabled="isSavingNotifications"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg> {{ isSavingNotifications ? $t('common.saving') : $t('settings.saveSettings') }}</button></div>
        </div>
      </div>

      <!-- Backup Settings (UPDATED with Database Download/Restore) -->
      <div v-if="activeTab === 'backup'" class="settings-section">
        <div class="settings-card glass-card">
          <div class="card-header"><div class="card-icon"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2 1.5 4 4 4h8c2.5 0 4-2 4-4V7M4 7a2 2 0 012-2h12a2 2 0 012 2M4 7l8 5 8-5" /></svg></div><h3>{{ $t('settings.backupSettings') }}</h3></div>
          <div class="settings-form">
            <div class="form-group"><label class="checkbox-label"><input type="checkbox" v-model="backupSettings.auto_backup"><span>{{ $t('settings.autoBackup') }}</span></label><p class="help-text">{{ $t('settings.autoBackupHelp') }}</p></div>
            <div class="form-group" v-if="backupSettings.auto_backup"><label>{{ $t('settings.backupFrequency') }}</label><select v-model="backupSettings.frequency" class="form-select"><option value="daily">{{ $t('settings.daily') }}</option><option value="weekly">{{ $t('settings.weekly') }}</option><option value="monthly">{{ $t('settings.monthly') }}</option></select></div>
            <div class="form-group" v-if="backupSettings.auto_backup"><label>{{ $t('settings.backupTime') }}</label><input type="time" v-model="backupSettings.backup_time" class="form-input"><p class="help-text">{{ $t('settings.backupTimeHelp') }}</p></div>
            <div class="form-group"><label>{{ $t('settings.backupLocation') }}</label><select v-model="backupSettings.location" class="form-select"><option value="local">{{ $t('settings.localStorage') }}</option><option value="cloud">{{ $t('settings.cloudStorage') }}</option><option value="both">{{ $t('settings.bothStorage') }}</option></select></div>
            <div class="form-group"><label>{{ $t('settings.retentionDays') }}</label><input type="number" v-model="backupSettings.retention_days" min="1" max="365" class="form-input"><p class="help-text">{{ $t('settings.retentionDaysHelp') }}</p></div>
          </div>
          <div class="form-actions">
            <button class="btn-primary" @click="saveBackupSettings" :disabled="isSavingBackup"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg> {{ isSavingBackup ? $t('common.saving') : $t('settings.saveSettings') }}</button>
            <button class="btn-secondary" @click="manualBackup" :disabled="isBackingUp"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :class="isBackingUp ? 'animate-spin' : ''" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg> {{ isBackingUp ? $t('settings.creatingBackup') : $t('settings.createManualBackup') }}</button>
          </div>
        </div>

        <!-- NEW: Database Export/Import Section -->
        <div class="settings-card glass-card">
          <div class="card-header">
            <div class="card-icon"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12m-4 4h8" /></svg></div>
            <h3>{{ $t('settings.databaseExportImport') }}</h3>
          </div>
          <div class="database-actions">
            <!-- Download Database -->
            <div class="action-item">
              <div class="action-info">
                <h4>{{ $t('settings.downloadDatabase') }}</h4>
                <p>{{ $t('settings.downloadDatabaseHelp') }}</p>
                <div v-if="databaseInfo" class="db-stats">
                  <span class="db-size">📦 {{ $t('settings.size') }}: {{ databaseInfo.size_mb }} MB</span>
                  <span class="db-tables">📊 {{ $t('settings.tables') }}: {{ databaseInfo.tables_count || 0 }}</span>
                  <span class="db-last">🕒 {{ $t('settings.lastModified') }}: {{ formatDate(databaseInfo.last_modified) }}</span>
                </div>
              </div>
              <button class="btn-primary" @click="downloadDatabase" :disabled="isDownloading">
                <svg class="w-4 h-4" :class="isDownloading ? 'animate-spin' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                {{ isDownloading ? $t('settings.preparingDownload') : $t('settings.downloadDatabaseBtn') }}
              </button>
            </div>

            <!-- Restore Database -->
            <div class="action-item">
              <div class="action-info">
                <h4>{{ $t('settings.restoreDatabase') }}</h4>
                <p>{{ $t('settings.restoreDatabaseHelp') }}</p>
                <div class="warning-note">⚠️ {{ $t('settings.restoreWarning') }}</div>
              </div>
              <div class="restore-area">
                <input type="file" ref="restoreFileInput" @change="handleFileSelect" accept=".zip" style="display: none" />
                <button class="btn-secondary" @click="selectRestoreFile" :disabled="isRestoring">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  {{ $t('settings.selectBackupFile') }}
                </button>
                <button class="btn-primary" @click="restoreDatabase" :disabled="!selectedFile || isRestoring">
                  <svg class="w-4 h-4" :class="isRestoring ? 'animate-spin' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  {{ isRestoring ? $t('settings.restoring') : $t('settings.restoreDatabaseBtn') }}
                </button>
                <span v-if="selectedFile" class="selected-file">{{ $t('settings.selectedFile') }}: {{ selectedFile.name }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Backups -->
        <div class="settings-card glass-card">
          <div class="card-header"><div class="card-icon"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg></div><h3>{{ $t('settings.recentBackups') }}</h3><span class="badge">{{ backups.length }} {{ $t('settings.backups') }}</span></div>
          <div class="backup-list">
            <div v-if="backups.length === 0" class="no-backups"><svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg><p>{{ $t('settings.noBackups') }}</p><button class="btn-primary-sm" @click="manualBackup">{{ $t('settings.createFirstBackup') }}</button></div>
            <div v-for="backup in backups" :key="backup.id" class="backup-item">
              <div class="backup-info"><svg class="backup-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg><div><div class="backup-name">{{ backup.name }}</div><div class="backup-meta"><span class="backup-date">{{ formatDate(backup.created_at) }}</span><span class="backup-size">{{ (backup.size_mb || 0).toFixed(2) }} MB</span><span class="backup-creator">{{ $t('settings.by') }} {{ backup.created_by || $t('settings.system') }}</span></div></div></div>
              <div class="backup-actions">
                <button class="btn-icon" @click="downloadBackup(backup)" :title="$t('settings.download')"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg></button>
                <button class="btn-icon danger" @click="deleteBackup(backup)" :title="$t('common.delete')"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- System Info -->
      <div v-if="activeTab === 'system'" class="settings-section">
        <div class="settings-card glass-card">
          <div class="card-header"><div class="card-icon"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg></div><h3>{{ $t('settings.systemInfo') }}</h3></div>
          <div class="info-grid">
            <div class="info-item"><label>{{ $t('settings.version') }}</label><span>{{ systemInfo.version || '2.0.0' }}</span></div>
            <div class="info-item"><label>{{ $t('settings.buildDate') }}</label><span>{{ systemInfo.build_date || '2024-03-15' }}</span></div>
            <div class="info-item"><label>{{ $t('settings.database') }}</label><span>{{ systemInfo.database || 'SQLite' }}</span></div>
            <div class="info-item"><label>{{ $t('settings.serverStatus') }}</label><span class="status-online"><span class="status-dot"></span>{{ systemInfo.server_status || $t('settings.online') }}</span></div>
            <div class="info-item"><label>{{ $t('settings.lastBackup') }}</label><span>{{ systemInfo.last_backup ? formatDate(systemInfo.last_backup) : $t('settings.never') }}</span></div>
            <div class="info-item"><label>{{ $t('settings.totalUsers') }}</label><span>{{ systemInfo.total_users || 0 }}</span></div>
            <div class="info-item"><label>{{ $t('settings.totalProducts') }}</label><span>{{ systemInfo.total_products || 0 }}</span></div>
            <div class="info-item"><label>{{ $t('settings.totalBranches') }}</label><span>{{ systemInfo.total_branches || 0 }}</span></div>
            <div class="info-item"><label>{{ $t('settings.recentSales') }}</label><span>{{ systemInfo.recent_sales || 0 }}</span></div>
            <div class="info-item"><label>{{ $t('settings.uptime') }}</label><span>{{ systemInfo.uptime_days || 0 }} {{ $t('common.days') }}</span></div>
            <div class="info-item"><label>{{ $t('settings.activeLoans') }}</label><span>{{ systemInfo.active_loans || 0 }}</span></div>
          </div>
        </div>

        <div class="settings-card glass-card">
          <div class="card-header"><div class="card-icon"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg></div><h3>{{ $t('settings.cacheManagement') }}</h3></div>
          <div class="cache-info">
            <div class="cache-stats"><div class="cache-stat"><label>{{ $t('settings.cacheSize') }}:</label><strong>{{ systemInfo.cache_size_mb || 0 }} MB</strong></div><div class="cache-stat"><label>{{ $t('settings.lastCleared') }}:</label><strong>{{ systemInfo.last_cache_clear ? formatDate(systemInfo.last_cache_clear) : $t('settings.never') }}</strong></div></div>
            <button class="btn-secondary" @click="clearCache" :disabled="isClearingCache"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :class="isClearingCache ? 'animate-spin' : ''" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg> {{ isClearingCache ? $t('settings.clearing') : $t('settings.clearCache') }}</button>
          </div>
        </div>

        <div class="settings-card glass-card danger">
          <div class="card-header"><div class="card-icon"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div><h3>{{ $t('settings.dangerZone') }}</h3></div>
          <div class="danger-zone">
            <div class="danger-item">
              <div class="danger-info"><h4>{{ $t('settings.exportAllData') }}</h4><p>{{ $t('settings.exportAllDataHelp') }}</p></div>
              <button class="btn-secondary" @click="exportAllData" :disabled="isExporting"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg> {{ isExporting ? $t('settings.exporting') : $t('settings.exportData') }}</button>
            </div>
            <div class="danger-item">
              <div class="danger-info"><h4>{{ $t('settings.resetAllData') }}</h4><p>{{ $t('settings.resetAllDataHelp') }}</p></div>
              <button class="btn-danger" @click="confirmResetData" :disabled="isResetting"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg> {{ isResetting ? $t('settings.resetting') : $t('settings.resetAllData') }}</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Bank Account Modal -->
    <div v-if="showBankAccountModal" class="modal-overlay" @click.self="closeBankAccountModal">
      <div class="modal-container">
        <div class="modal-header"><h2>{{ editingBankAccount ? $t('settings.editBankAccount') : $t('settings.addBankAccount') }}</h2><button @click="closeBankAccountModal" class="modal-close"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button></div>
        <div class="modal-body">
          <form @submit.prevent="saveBankAccount">
            <div class="form-group"><label>{{ $t('settings.bankName') }} *</label><input type="text" v-model="bankAccountForm.bank_name" class="form-input" required></div>
            <div class="form-group"><label>{{ $t('settings.accountNumber') }} *</label><input type="text" v-model="bankAccountForm.account_number" class="form-input" required></div>
            <div class="form-group"><label>{{ $t('settings.accountName') }} *</label><input type="text" v-model="bankAccountForm.account_name" class="form-input" required></div>
            <div class="form-group"><label>{{ $t('settings.accountType') }}</label><select v-model="bankAccountForm.account_type" class="form-select"><option value="checking">{{ $t('settings.checking') }}</option><option value="savings">{{ $t('settings.savings') }}</option><option value="business">{{ $t('settings.business') }}</option></select></div>
            <div class="form-group"><label>{{ $t('settings.currency') }}</label><select v-model="bankAccountForm.currency" class="form-select"><option value="ETB">{{ $t('settings.currencyETB') }}</option><option value="USD">{{ $t('settings.currencyUSD') }}</option><option value="EUR">{{ $t('settings.currencyEUR') }}</option><option value="GBP">{{ $t('settings.currencyGBP') }}</option></select></div>
            <div class="form-group"><label>{{ $t('settings.branch') }}</label><select v-model="bankAccountForm.branch_id" class="form-select" required><option value="">{{ $t('settings.selectBranch') }}</option><option v-for="branch in branches" :key="branch.id" :value="branch.id">{{ branch.name }}</option></select></div>
            <div class="form-group"><label class="checkbox-label"><input type="checkbox" v-model="bankAccountForm.is_active"><span>{{ $t('common.active') }}</span></label></div>
            <div class="form-group"><label>{{ $t('common.notes') }} ({{ $t('common.optional') }})</label><textarea v-model="bankAccountForm.notes" rows="3" class="form-textarea" :placeholder="$t('settings.notesPlaceholder')"></textarea></div>
            <div class="modal-actions"><button type="button" class="btn-secondary" @click="closeBankAccountModal">{{ $t('common.cancel') }}</button><button type="submit" class="btn-primary" :disabled="isSavingBankAccount">{{ isSavingBankAccount ? $t('common.saving') : (editingBankAccount ? $t('common.update') : $t('common.create')) }}</button></div>
          </form>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div v-if="showConfirmModal" class="modal-overlay" @click.self="closeConfirmModal">
      <div class="modal-container">
        <div class="modal-header"><h2>{{ $t('settings.confirmAction') }}</h2><button @click="closeConfirmModal" class="modal-close"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button></div>
        <div class="modal-body">
          <div class="warning-icon"><svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div>
          <p class="confirm-message">{{ confirmMessage }}</p>
          <p class="warning-text">{{ $t('settings.cannotUndo') }}</p>
          <div class="modal-actions"><button class="btn-secondary" @click="closeConfirmModal">{{ $t('common.cancel') }}</button><button class="btn-danger" @click="executeConfirmAction">{{ $t('settings.absolutelySure') }}</button></div>
        </div>
      </div>
    </div>

    <!-- Toast Notifications -->
    <transition name="toast">
      <div v-if="showToast" :class="['toast', toastType]">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path v-if="toastType === 'success'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /><path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>{{ toastMessage }}</span>
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '@/services/api'

export default {
  name: 'SystemSettings',
  setup() {
    const { t } = useI18n()
    const activeTab = ref('general')
    const isLoading = ref(true)
    const isSaving = ref(false)
    const isSavingNotifications = ref(false)
    const isSavingBackup = ref(false)
    const isBackingUp = ref(false)
    const isClearingCache = ref(false)
    const isResetting = ref(false)
    const isExporting = ref(false)
    const showConfirmModal = ref(false)
    const confirmMessage = ref('')
    const confirmAction = ref(null)
    const showToast = ref(false)
    const toastMessage = ref('')
    const toastType = ref('success')
    
    // New refs for database download/restore
    const isDownloading = ref(false)
    const isRestoring = ref(false)
    const selectedFile = ref(null)
    const restoreFileInput = ref(null)
    const databaseInfo = ref(null)
    
    const bankAccounts = ref([])
    const branches = ref([])
    const showBankAccountModal = ref(false)
    const editingBankAccount = ref(null)
    const isSavingBankAccount = ref(false)
    const bankAccountForm = ref({ bank_name: '', account_number: '', account_name: '', account_type: 'checking', currency: 'ETB', branch_id: '', is_active: true, notes: '' })
    
    const tabs = [
      { id: 'general', nameKey: 'settings.general', iconPath: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
      { id: 'bankaccounts', nameKey: 'settings.bankAccounts', iconPath: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H7a3 3 0 00-3 3v8a3 3 0 003 3z' },
      { id: 'notifications', nameKey: 'settings.notifications', iconPath: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
      { id: 'backup', nameKey: 'settings.backup', iconPath: 'M4 7v10c0 2 1.5 4 4 4h8c2.5 0 4-2 4-4V7M4 7a2 2 0 012-2h12a2 2 0 012 2M4 7l8 5 8-5' },
      { id: 'system', nameKey: 'settings.system', iconPath: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z' }
    ]
    
    const settings = ref({ system_name: '', timezone: '', date_format: '', currency: '', language: '', items_per_page: 20 })
    const notificationSettings = ref({ low_stock_email: false, daily_report_email: false, sms_alerts: false, loan_overdue_alerts: false, email_recipients: '', sms_recipients: '' })
    const backupSettings = ref({ auto_backup: false, frequency: 'daily', backup_time: '23:00', location: 'local', retention_days: 30 })
    const backups = ref([])
    const systemInfo = ref({ version: '', build_date: '', database: '', server_status: '', total_users: 0, total_products: 0, total_branches: 0, recent_sales: 0, uptime_days: 0, active_loans: 0, last_backup: null, cache_size_mb: 0, last_cache_clear: null })
    
    const formatDate = (date) => date ? new Date(date).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'
    
    const showSuccessToast = (msg) => { toastType.value = 'success'; toastMessage.value = msg; showToast.value = true; setTimeout(() => { showToast.value = false }, 3000) }
    const showErrorToast = (msg) => { toastType.value = 'error'; toastMessage.value = msg; showToast.value = true; setTimeout(() => { showToast.value = false }, 3000) }
    
    // Database Download Function
    const downloadDatabase = async () => {
      isDownloading.value = true
      try {
        const response = await api.get('/settings/database/download', {
          responseType: 'blob'
        })
        
        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        
        // Extract filename from Content-Disposition header or use default
        const contentDisposition = response.headers['content-disposition']
        let filename = `database_backup_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.zip`
        if (contentDisposition) {
          const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
          if (match && match[1]) filename = match[1].replace(/['"]/g, '')
        }
        
        link.setAttribute('download', filename)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
        
        showSuccessToast(t('settings.downloadSuccess'))
      } catch (error) {
        console.error('Download error:', error)
        showErrorToast(error.response?.data?.detail || t('settings.downloadFailed'))
      } finally {
        isDownloading.value = false
      }
    }
    
    // Select restore file
    const selectRestoreFile = () => {
      restoreFileInput.value.click()
    }
    
    // Handle file selection
    const handleFileSelect = (event) => {
      const file = event.target.files[0]
      if (file && file.name.endsWith('.zip')) {
        selectedFile.value = file
        showSuccessToast(t('settings.fileSelected', { name: file.name }))
      } else if (file) {
        showErrorToast(t('settings.invalidFileType'))
        selectedFile.value = null
      }
    }
    
    // Restore Database
    const restoreDatabase = async () => {
      if (!selectedFile.value) {
        showErrorToast(t('settings.selectFileFirst'))
        return
      }
      
      confirmAction.value = async () => {
        isRestoring.value = true
        try {
          const formData = new FormData()
          formData.append('backup_file', selectedFile.value)
          
          const response = await api.post('/settings/database/restore/simple', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
          
          showSuccessToast(t('settings.restoreSuccess'))
          selectedFile.value = null
          restoreFileInput.value.value = ''
          
          // Refresh database info and settings
          await loadDatabaseInfo()
          await loadSettings()
          
          // Optional: Reload page after 2 seconds to refresh all data
          setTimeout(() => {
            if (confirm(t('settings.reloadPage'))) {
              window.location.reload()
            }
          }, 2000)
        } catch (error) {
          console.error('Restore error:', error)
          showErrorToast(error.response?.data?.detail || t('settings.restoreFailed'))
        } finally {
          isRestoring.value = false
        }
      }
      
      confirmMessage.value = t('settings.restoreConfirm')
      showConfirmModal.value = true
    }
    
    // Load database info
    const loadDatabaseInfo = async () => {
      try {
        const response = await api.get('/settings/database/info')
        databaseInfo.value = response.data
        if (databaseInfo.value) {
          databaseInfo.value.size_mb = databaseInfo.value.size_mb?.toFixed(2) || '0'
          databaseInfo.value.tables_count = databaseInfo.value.tables?.length || 0
        }
      } catch (error) {
        console.error('Failed to load database info:', error)
        // Don't show error toast for this, it's not critical
      }
    }
    
    const loadBankAccounts = async () => { try { bankAccounts.value = (await api.get('/sales/bank-accounts')).data || [] } catch (e) { bankAccounts.value = [] } }
    const loadBranches = async () => { try { branches.value = (await api.get('/branches')).data || [] } catch (e) { branches.value = [] } }
    
    const openAddBankAccountModal = () => { editingBankAccount.value = null; bankAccountForm.value = { bank_name: '', account_number: '', account_name: '', account_type: 'checking', currency: 'ETB', branch_id: '', is_active: true, notes: '' }; showBankAccountModal.value = true }
    const editBankAccount = (a) => { editingBankAccount.value = a; bankAccountForm.value = { bank_name: a.bank_name, account_number: a.account_number, account_name: a.account_name, account_type: a.account_type, currency: a.currency, branch_id: a.branch_id, is_active: a.is_active, notes: a.notes || '' }; showBankAccountModal.value = true }
    
    const saveBankAccount = async () => {
      if (!bankAccountForm.value.bank_name || !bankAccountForm.value.account_number || !bankAccountForm.value.account_name || !bankAccountForm.value.branch_id) { showErrorToast(t('settings.fillRequired')); return }
      isSavingBankAccount.value = true
      try {
        if (editingBankAccount.value) { await api.put(`/sales/bank-accounts/${editingBankAccount.value.id}`, bankAccountForm.value); showSuccessToast(t('settings.bankAccountUpdated')) }
        else { await api.post('/sales/bank-accounts', bankAccountForm.value); showSuccessToast(t('settings.bankAccountCreated')) }
        await loadBankAccounts(); closeBankAccountModal()
      } catch (e) { showErrorToast(e.response?.data?.detail || t('settings.saveFailed')) } finally { isSavingBankAccount.value = false }
    }
    
    const activateBankAccount = async (a) => { try { await api.patch(`/sales/bank-accounts/${a.id}/activate`); await loadBankAccounts(); showSuccessToast(t('settings.activated', { name: a.bank_name })) } catch (e) { showErrorToast(e.response?.data?.detail || t('settings.activateFailed')) } }
    const deactivateBankAccount = async (a) => { confirmAction.value = async () => { try { await api.delete(`/sales/bank-accounts/${a.id}`); await loadBankAccounts(); showSuccessToast(t('settings.deactivated', { name: a.bank_name })) } catch (e) { showErrorToast(e.response?.data?.detail || t('settings.deactivateFailed')) } }; confirmMessage.value = t('settings.deactivateConfirm', { name: a.bank_name }); showConfirmModal.value = true }
    const deleteBankAccount = async (a) => { confirmAction.value = async () => { try { await api.delete(`/sales/bank-accounts/${a.id}`); await loadBankAccounts(); showSuccessToast(t('settings.deleted', { name: a.bank_name })) } catch (e) { showErrorToast(e.response?.data?.detail || t('settings.deleteFailed')) } }; confirmMessage.value = t('settings.deleteConfirm', { name: a.bank_name }); showConfirmModal.value = true }
    const closeBankAccountModal = () => { showBankAccountModal.value = false; editingBankAccount.value = null }
    
    const loadSettings = async () => {
      isLoading.value = true
      try {
        const [g, n, b, bk, s] = await Promise.all([api.get('/settings/general'), api.get('/settings/notifications'), api.get('/settings/backup'), api.get('/settings/backups'), api.get('/settings/system/info')])
        settings.value = { ...settings.value, ...g.data }; notificationSettings.value = { ...notificationSettings.value, ...n.data }; backupSettings.value = { ...backupSettings.value, ...b.data }; backups.value = bk.data || []; systemInfo.value = { ...systemInfo.value, ...s.data }
      } catch (e) { showErrorToast(t('settings.loadFailed')) } finally { isLoading.value = false }
    }
    
    const saveSettings = async () => { isSaving.value = true; try { await api.put('/settings/general', { settings: settings.value }); showSuccessToast(t('settings.settingsSaved')) } catch (e) { showErrorToast(e.response?.data?.detail || t('settings.saveFailed')) } finally { isSaving.value = false } }
    
    const saveNotificationSettings = async () => {
      isSavingNotifications.value = true
      try {
        const payload = { low_stock_email: notificationSettings.value.low_stock_email, daily_report_email: notificationSettings.value.daily_report_email, sms_alerts: notificationSettings.value.sms_alerts, loan_overdue_alerts: notificationSettings.value.loan_overdue_alerts, email_recipients: notificationSettings.value.email_recipients.split(/[,\n]/).map(e => e.trim()).filter(e => e && e.includes('@')), sms_recipients: notificationSettings.value.sms_recipients.split(/[,\n]/).map(p => p.trim()).filter(p => p) }
        await api.put('/settings/notifications', { settings: payload }); showSuccessToast(t('settings.settingsSaved'))
      } catch (e) { showErrorToast(e.response?.data?.detail || t('settings.saveFailed')) } finally { isSavingNotifications.value = false }
    }
    
    const saveBackupSettings = async () => { isSavingBackup.value = true; try { await api.put('/settings/backup', { settings: backupSettings.value }); showSuccessToast(t('settings.settingsSaved')) } catch (e) { showErrorToast(e.response?.data?.detail || t('settings.saveFailed')) } finally { isSavingBackup.value = false } }
    
    const manualBackup = async () => { isBackingUp.value = true; try { const r = await api.post('/settings/backup/create'); backups.value.unshift(r.data); showSuccessToast(t('settings.backupCreated')) } catch (e) { showErrorToast(e.response?.data?.detail || t('settings.backupFailed')) } finally { isBackingUp.value = false } }
    
    const downloadBackup = async (bk) => { try { const r = await api.get(`/settings/backups/${bk.id}/download`, { responseType: 'blob' }); const url = window.URL.createObjectURL(new Blob([r.data])); const a = document.createElement('a'); a.href = url; a.setAttribute('download', bk.name); document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(url); showSuccessToast(t('settings.downloading', { name: bk.name })) } catch (e) { showErrorToast(t('settings.downloadFailed')) } }
    
    const deleteBackup = async (bk) => { confirmAction.value = async () => { try { await api.delete(`/settings/backups/${bk.id}`); const i = backups.value.findIndex(b => b.id === bk.id); if (i !== -1) backups.value.splice(i, 1); showSuccessToast(t('settings.backupDeleted')) } catch (e) { showErrorToast(e.response?.data?.detail || t('settings.backupDeleteFailed')) } }; confirmMessage.value = t('settings.backupDeleteConfirm', { name: bk.name }); showConfirmModal.value = true }
    
    const clearCache = async () => { isClearingCache.value = true; try { const r = await api.post('/settings/cache/clear'); systemInfo.value.cache_size_mb = r.data.size_freed_mb || 0; systemInfo.value.last_cache_clear = new Date().toISOString(); showSuccessToast(t('settings.cacheCleared')) } catch (e) { showErrorToast(e.response?.data?.detail || t('settings.cacheClearFailed')) } finally { isClearingCache.value = false } }
    
    const exportAllData = async () => { isExporting.value = true; try { const r = await api.post('/settings/system/export'); const ds = JSON.stringify(r.data, null, 2); const du = 'data:application/json;charset=utf-8,' + encodeURIComponent(ds); const a = document.createElement('a'); a.setAttribute('href', du); a.setAttribute('download', `system_export_${new Date().toISOString().slice(0, 19)}.json`); a.click(); showSuccessToast(t('settings.dataExported')) } catch (e) { showErrorToast(e.response?.data?.detail || t('settings.exportFailed')) } finally { isExporting.value = false } }
    
    const resetAllData = async () => { isResetting.value = true; try { await api.post('/settings/system/reset'); showSuccessToast(t('settings.dataReset')); setTimeout(() => { window.location.href = '/login' }, 2000) } catch (e) { showErrorToast(e.response?.data?.detail || t('settings.resetFailed')) } finally { isResetting.value = false } }
    
    const confirmResetData = () => { confirmMessage.value = t('settings.resetConfirm'); confirmAction.value = resetAllData; showConfirmModal.value = true }
    const closeConfirmModal = () => { showConfirmModal.value = false; confirmAction.value = null }
    const executeConfirmAction = () => { if (confirmAction.value) confirmAction.value(); closeConfirmModal() }
    
    onMounted(() => { loadSettings(); loadBankAccounts(); loadBranches(); loadDatabaseInfo() })
    
    return { activeTab, tabs, settings, notificationSettings, backupSettings, backups, systemInfo, bankAccounts, branches, showBankAccountModal, editingBankAccount, isSavingBankAccount, bankAccountForm, isLoading, isSaving, isSavingNotifications, isSavingBackup, isBackingUp, isClearingCache, isResetting, isExporting, showConfirmModal, confirmMessage, showToast, toastMessage, toastType, formatDate, saveSettings, saveNotificationSettings, saveBackupSettings, manualBackup, downloadBackup, deleteBackup, clearCache, exportAllData, confirmResetData, closeConfirmModal, executeConfirmAction, openAddBankAccountModal, editBankAccount, saveBankAccount, activateBankAccount, deactivateBankAccount, deleteBankAccount, closeBankAccountModal, downloadDatabase, restoreDatabase, selectRestoreFile, handleFileSelect, isDownloading, isRestoring, selectedFile, restoreFileInput, databaseInfo, loadDatabaseInfo }
  }
}
</script>

<style scoped>
/* Add these new styles for database actions */
.database-actions {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.action-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 16px;
  flex-wrap: wrap;
  gap: 1rem;
  transition: all 0.2s ease;
}

.action-item:hover {
  background: rgba(47, 184, 166, 0.05);
}

.action-info {
  flex: 1;
}

.action-info h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #1A2A2E;
  margin-bottom: 0.5rem;
}

.action-info p {
  font-size: 0.8rem;
  color: #6E8B90;
  margin-bottom: 0.5rem;
}

.db-stats {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
  font-size: 0.7rem;
  color: #6E8B90;
}

.db-stats span {
  background: rgba(0, 0, 0, 0.05);
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
}

.warning-note {
  font-size: 0.75rem;
  color: #F97316;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: rgba(249, 115, 22, 0.1);
  border-radius: 8px;
}

.restore-area {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: flex-end;
}

.selected-file {
  font-size: 0.75rem;
  color: #2FB8A6;
  background: rgba(47, 184, 166, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
}

@media (max-width: 768px) {
  .action-item {
    flex-direction: column;
    text-align: center;
  }
  
  .restore-area {
    width: 100%;
    align-items: center;
  }
  
  .db-stats {
    justify-content: center;
  }
}

/* Rest of the existing styles remain the same */
.bank-accounts-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.no-data {
  text-align: center;
  padding: 3rem;
  color: #6E8B90;
}

.no-data svg {
  margin-bottom: 1rem;
  color: #6E8B90;
  opacity: 0.5;
}

.bank-account-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 12px;
  transition: all 0.2s ease;
  flex-wrap: wrap;
  gap: 1rem;
}

.bank-account-item:hover {
  background: rgba(47, 184, 166, 0.05);
  transform: translateX(4px);
}

.account-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.account-icon {
  width: 48px;
  height: 48px;
  background: rgba(47, 184, 166, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2FB8A6;
}

.account-details {
  flex: 1;
}

.account-name {
  font-weight: 600;
  color: #1A2A2E;
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.account-number {
  font-family: monospace;
  font-size: 0.85rem;
  color: #2FB8A6;
  margin-bottom: 0.25rem;
}

.account-holder {
  font-size: 0.8rem;
  color: #6E8B90;
  margin-bottom: 0.25rem;
}

.account-meta {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.account-type {
  font-size: 0.7rem;
  padding: 0.125rem 0.5rem;
  background: rgba(47, 184, 166, 0.1);
  border-radius: 4px;
  color: #2FB8A6;
  text-transform: uppercase;
}

.account-currency {
  font-size: 0.7rem;
  padding: 0.125rem 0.5rem;
  background: rgba(110, 139, 144, 0.1);
  border-radius: 4px;
  color: #6E8B90;
}

.account-status {
  font-size: 0.7rem;
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
}

.account-status.active {
  background: rgba(52, 211, 153, 0.1);
  color: #34D399;
}

.account-status.inactive {
  background: rgba(239, 68, 68, 0.1);
  color: #EF4444;
}

.account-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon.success {
  color: #34D399;
  border-color: rgba(52, 211, 153, 0.2);
}

.btn-icon.success:hover {
  background: rgba(52, 211, 153, 0.1);
  border-color: #34D399;
}

.btn-icon.warning {
  color: #F97316;
  border-color: rgba(249, 115, 22, 0.2);
}

.btn-icon.warning:hover {
  background: rgba(249, 115, 22, 0.1);
  border-color: #F97316;
}

/* Teal Glassmorphism Theme */
.settings-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  animation: fadeIn 0.5s ease-out;
}

.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1A2A2E;
  margin-bottom: 0.25rem;
}

.page-subtitle {
  color: #6E8B90;
  font-size: 0.9rem;
}

/* Glass Card */
.glass-card {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.glass-card:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(47, 184, 166, 0.2);
  border-top-color: #2FB8A6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Settings Tabs */
.settings-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding: 0.5rem;
  flex-wrap: wrap;
}

.settings-tabs button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: transparent;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #6E8B90;
  font-weight: 500;
  font-size: 0.9rem;
}

.settings-tabs button:hover {
  background: rgba(47, 184, 166, 0.1);
  color: #2FB8A6;
}

.settings-tabs button.active {
  background: linear-gradient(135deg, #2FB8A6, #6FD3C3);
  color: white;
  box-shadow: 0 2px 8px rgba(47, 184, 166, 0.2);
}

/* Settings Sections */
.settings-section {
  max-width: 800px;
  margin: 0 auto;
}

.settings-card {
  margin-bottom: 1.5rem;
}

.settings-card.danger {
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.05);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  flex-wrap: wrap;
}

.card-icon {
  width: 40px;
  height: 40px;
  background: rgba(47, 184, 166, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2FB8A6;
}

.card-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1A2A2E;
  margin: 0;
  flex: 1;
}

.badge {
  background: rgba(47, 184, 166, 0.1);
  color: #2FB8A6;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
}

/* Form Styles */
.settings-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #1A2A2E;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(47, 184, 166, 0.2);
  border-radius: 12px;
  background: white;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #2FB8A6;
  box-shadow: 0 0 0 3px rgba(47, 184, 166, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
  font-family: monospace;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.checkbox-label input {
  width: 1.1rem;
  height: 1.1rem;
  cursor: pointer;
  accent-color: #2FB8A6;
}

.checkbox-label span {
  font-size: 0.9rem;
  color: #1A2A2E;
  font-weight: 500;
}

.help-text {
  font-size: 0.7rem;
  color: #6E8B90;
  margin-top: 0.25rem;
  line-height: 1.4;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  flex-wrap: wrap;
}

/* Buttons */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #2FB8A6, #6FD3C3);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(47, 184, 166, 0.3);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-primary-sm {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #2FB8A6, #6FD3C3);
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.btn-primary-sm:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(47, 184, 166, 0.3);
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(110, 139, 144, 0.1);
  border: 1px solid rgba(110, 139, 144, 0.2);
  border-radius: 12px;
  color: #1A2A2E;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(110, 139, 144, 0.2);
  transform: translateY(-1px);
}

.btn-danger {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 12px;
  color: #EF4444;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.btn-danger:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.2);
  transform: translateY(-1px);
}

.btn-icon {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1px solid rgba(47, 184, 166, 0.2);
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #6E8B90;
}

.btn-icon:hover {
  background: rgba(47, 184, 166, 0.1);
  border-color: #2FB8A6;
  color: #2FB8A6;
  transform: scale(1.05);
}

.btn-icon.danger:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: #EF4444;
  color: #EF4444;
}

/* Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 0.75rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.info-item:hover {
  background: rgba(47, 184, 166, 0.05);
}

.info-item label {
  font-size: 0.8rem;
  font-weight: 500;
  color: #6E8B90;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-item span {
  font-size: 0.9rem;
  color: #1A2A2E;
  font-weight: 600;
}

.status-online {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #34D399;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #34D399;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.9); }
}

/* Cache Info */
.cache-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.cache-stats {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.cache-stat {
  display: flex;
  gap: 0.5rem;
  align-items: baseline;
}

.cache-stat label {
  font-size: 0.8rem;
  color: #6E8B90;
}

.cache-stat strong {
  font-size: 0.9rem;
  color: #1A2A2E;
}

/* Backup List */
.backup-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.no-backups {
  text-align: center;
  padding: 3rem;
  color: #6E8B90;
}

.no-backups svg {
  margin-bottom: 1rem;
  color: #6E8B90;
  opacity: 0.5;
}

.backup-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 12px;
  flex-wrap: wrap;
  gap: 1rem;
  transition: all 0.2s ease;
}

.backup-item:hover {
  background: rgba(47, 184, 166, 0.05);
  transform: translateX(4px);
}

.backup-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.backup-icon {
  width: 32px;
  height: 32px;
  color: #2FB8A6;
}

.backup-name {
  font-weight: 600;
  color: #1A2A2E;
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
}

.backup-meta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  font-size: 0.7rem;
}

.backup-date {
  color: #6E8B90;
}

.backup-size {
  color: #2FB8A6;
  font-weight: 500;
}

.backup-creator {
  color: #6E8B90;
}

.backup-actions {
  display: flex;
  gap: 0.5rem;
}

/* Danger Zone */
.danger-zone {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.danger-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  background: white;
  border-radius: 16px;
  flex-wrap: wrap;
  gap: 1rem;
  transition: all 0.2s ease;
  border: 1px solid rgba(239, 68, 68, 0.1);
}

.danger-item:hover {
  border-color: rgba(239, 68, 68, 0.3);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.1);
}

.danger-info {
  flex: 1;
}

.danger-info h4 {
  font-size: 0.95rem;
  font-weight: 600;
  color: #EF4444;
  margin: 0 0 0.25rem 0;
}

.danger-info p {
  font-size: 0.75rem;
  color: #6E8B90;
  margin: 0;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

.modal-container {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-radius: 28px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1A2A2E;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  color: #6E8B90;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #1A2A2E;
}

.modal-body {
  padding: 1.5rem;
  text-align: center;
}

.warning-icon {
  margin-bottom: 1rem;
  color: #F97316;
}

.confirm-message {
  font-size: 1rem;
  color: #1A2A2E;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.warning-text {
  color: #EF4444;
  font-size: 0.8rem;
  font-weight: 500;
  margin-top: 1rem;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  z-index: 2000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideInRight 0.3s ease;
}

.toast.success {
  background: #34D399;
  color: white;
}

.toast.error {
  background: #EF4444;
  color: white;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-spin {
  animation: spin 0.8s linear infinite;
}

/* Responsive */
@media (max-width: 768px) {
  .settings-page {
    padding: 1rem;
  }
  
  .settings-tabs {
    overflow-x: auto;
    flex-wrap: nowrap;
    -webkit-overflow-scrolling: touch;
  }
  
  .settings-tabs button {
    white-space: nowrap;
  }
  
  .danger-item {
    flex-direction: column;
    text-align: center;
  }
  
  .cache-info {
    flex-direction: column;
    text-align: center;
  }
  
  .cache-stats {
    justify-content: center;
  }
  
  .backup-item {
    flex-direction: column;
    text-align: center;
  }
  
  .backup-info {
    flex-direction: column;
    text-align: center;
  }
  
  .backup-meta {
    justify-content: center;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .form-actions button {
    width: 100%;
    justify-content: center;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .settings-card {
    padding: 1rem;
  }
  
  .card-header {
    flex-wrap: wrap;
  }
  
  .btn-primary,
  .btn-secondary,
  .btn-danger {
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
  }
  
  .modal-container {
    width: 95%;
    margin: 1rem;
  }
}
</style>