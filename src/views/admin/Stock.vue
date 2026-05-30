<template>
  <div class="stock-container">
    <!-- Header Section -->
    <div class="header-section">
      <div>
        <h1 class="page-title">{{ $t('stock.title') }}</h1>
        <p class="page-subtitle">{{ $t('stock.adminSubtitle') }}</p>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-cards">
      <div class="stat-card-mini">
        <div class="stat-icon-mini bg-teal-100">
          <svg class="stat-mini-svg text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <div>
          <p class="stat-value-mini">{{ groupedStockData.length }}</p>
          <p class="stat-label-mini">{{ $t('stock.productGroups') }}</p>
        </div>
      </div>
      <div class="stat-card-mini">
        <div class="stat-icon-mini bg-orange-100">
          <svg class="stat-mini-svg text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <p class="stat-value-mini">{{ lowStockGroupsCount }}</p>
          <p class="stat-label-mini">{{ $t('stock.groupsLowStock') }}</p>
        </div>
      </div>
      <div class="stat-card-mini">
        <div class="stat-icon-mini bg-red-100">
          <svg class="stat-mini-svg text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p class="stat-value-mini">{{ outOfStockGroupsCount }}</p>
          <p class="stat-label-mini">{{ $t('stock.groupsOutOfStock') }}</p>
        </div>
      </div>
      <div class="stat-card-mini">
        <div class="stat-icon-mini bg-green-100">
          <svg class="stat-mini-svg text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p class="stat-value-mini">{{ totalStockValueFormatted }}</p>
          <p class="stat-label-mini">{{ $t('stock.totalStockValue') }}</p>
        </div>
      </div>
    </div>

    <!-- Branch Selector -->
    <div class="branch-selector glass-card">
      <div class="selector-content">
        <div class="selector-icon">
          <svg class="selector-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div class="selector-inputs">
          <select v-model="selectedBranch" class="branch-select">
            <option :value="null">{{ $t('stock.selectBranch') }}</option>
            <option v-for="branch in branches" :key="branch.id" :value="branch.id">{{ branch.name }}</option>
          </select>
          <label class="low-stock-filter">
            <input v-model="lowStockOnly" type="checkbox" />
            <span>{{ $t('stock.showLowStockOnly') }}</span>
          </label>
          <button @click="fetchStock" class="refresh-btn">
            <svg class="refresh-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {{ $t('common.refresh') }}
          </button>
        </div>
      </div>
    </div>

    <!-- No Branch Selected State -->
    <div v-if="!selectedBranch" class="empty-state glass-card">
      <svg class="empty-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <h3>{{ $t('stock.noBranchSelected') }}</h3>
      <p>{{ $t('stock.selectBranchMessage') }}</p>
    </div>

    <!-- Stock Table with Grouping -->
    <div v-else class="stock-table-container glass-card">
      <div class="table-header">
        <h3 class="table-title">{{ $t('stock.inventoryList') }}</h3>
        <span class="table-count">{{ groupedStockData.length }} {{ $t('products.groups') }}</span>
      </div>
      
      <div class="overflow-x-auto">
        <table class="stock-table">
          <thead>
            <tr>
              <th>{{ $t('stock.groupProduct') }}</th>
              <th>{{ $t('products.sku') }}</th>
              <th>{{ $t('stock.currentStock') }}</th>
              <th>{{ $t('stock.stockBreakdown') }}</th>
              <th>{{ $t('stock.reorderLevel') }}</th>
              <th>{{ $t('common.status') }}</th>
              <th class="text-right">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="group in filteredStockData" :key="group.prefix">
              <tr class="group-row" @click="toggleGroup(group.prefix)">
                <td colspan="7" class="group-header">
                  <div class="group-header-content">
                    <div class="group-info">
                      <svg class="group-icon" :class="{ 'rotated': expandedGroups.has(group.prefix) }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                      </svg>
                      <span class="group-prefix">{{ group.prefix }}</span>
                      <span class="group-count">({{ group.items.length }} {{ $t('products.variants') }})</span>
                      <span class="group-total-stock">{{ $t('products.totalStockUnits', { count: group.totalQuantity }) }}</span>
                    </div>
                    <div class="group-actions">
                      <span :class="getGroupStatusBadge(group.status)" class="status-badge">
                        <span class="status-dot" :class="group.status"></span>
                        {{ getGroupStatusText(group.status) }}
                      </span>
                      <button @click.stop="addStockToGroup(group)" class="action-btn add-stock-btn" :title="$t('stock.addStock')">
                        <svg class="action-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                        <span>{{ $t('stock.addStock') }}</span>
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
              
              <template v-if="expandedGroups.has(group.prefix)">
                <tr v-for="item in group.items" :key="item.product_id" class="stock-row sub-stock-row">
                  <td class="product-cell sub-product">
                    <div class="product-name">{{ item.product_name }}</div>
                    <div class="product-category" v-if="item.category">{{ item.category }}</div>
                  </td>
                  <td class="sku-cell sub-sku">{{ item.product_sku }}</td>
                  <td class="stock-cell">
                    <div class="stock-quantity">
                      <span :class="getStockClass(item.quantity)" class="stock-value">{{ item.quantity }} {{ $t('common.units') }}</span>
                      <div class="stock-bar"><div class="stock-fill" :style="{ width: getStockPercentage(item.quantity, item.reorder_level) + '%' }"></div></div>
                    </div>
                  </td>
                  <td class="breakdown-cell">
                    <div class="stock-breakdown">
                      <div class="breakdown-item vat-stock">
                        <span class="breakdown-label">{{ $t('stock.withVat') }}:</span>
                        <span class="breakdown-value">{{ item.stock_with_vat || 0 }}</span>
                      </div>
                      <div class="breakdown-item no-vat-stock">
                        <span class="breakdown-label">{{ $t('stock.withoutVat') }}:</span>
                        <span class="breakdown-value">{{ item.stock_without_vat || 0 }}</span>
                      </div>
                      <div class="breakdown-total">
                        <span class="breakdown-label">{{ $t('stock.totalStock') }}:</span>
                        <span class="breakdown-value total">{{ item.quantity || 0 }}</span>
                      </div>
                    </div>
                  </td>
                  <td class="reorder-cell">
                    <div class="reorder-info">
                      <span class="reorder-value">{{ item.reorder_level }} {{ $t('common.units') }}</span>
                      <button v-if="item.quantity < item.reorder_level" @click.stop="openAddStock(item)" class="quick-restock">{{ $t('stock.restock') }}</button>
                    </div>
                  </td>
                  <td class="status-cell">
                    <span :class="getStatusBadge(item.status)" class="status-badge">
                      <span class="status-dot" :class="item.status"></span>
                      {{ getStatusText(item.status) }}
                    </span>
                  </td>
                  <td class="actions-cell">
                    <div class="action-buttons">
                      <button @click.stop="openAddStock(item)" class="action-btn add-stock-btn" :title="$t('stock.addStock')">
                        <svg class="action-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                        <span>{{ $t('common.add') }}</span>
                      </button>
                      <button @click.stop="openStockHistory(item)" class="action-btn history-btn" :title="$t('stock.stockHistory')">
                        <svg class="action-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                        <span>{{ $t('stock.history') }}</span>
                      </button>
                      <button @click.stop="openAdjustStock(item)" class="action-btn adjust-btn" :title="$t('stock.adjustment')">
                        <svg class="action-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <span>{{ $t('stock.adjust') }}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </template>
            </template>
            
            <tr v-if="!filteredStockData.length">
              <td colspan="7" class="empty-table-state">
                <svg class="empty-svg-small" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                <p>{{ $t('stock.noStockData') }}</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add Stock Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="closeAddStock">
      <div class="modal-container">
        <div class="modal-header">
          <h2 class="modal-title">{{ $t('stock.addStock') }}</h2>
          <button @click="closeAddStock" class="modal-close"><svg class="modal-close-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
        <div class="modal-product-info">
          <div class="product-icon">
            <svg class="product-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
          </div>
          <div>
            <p class="product-name-modal">{{ selectedProduct?.product_name }}</p>
            <p class="product-sku-modal">{{ selectedProduct?.product_sku }}</p>
          </div>
        </div>
        <form @submit.prevent="addStock" class="modal-form">
          <div class="form-field">
            <label class="form-label">{{ $t('stock.quantityToAdd') }} *</label>
            <input v-model.number="addQuantity" type="number" step="1" min="1" class="form-input" required :placeholder="$t('stock.enterQuantity')" />
          </div>
          <div class="form-field">
            <label class="form-label">{{ $t('stock.withVat') }}?</label>
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" v-model="addWithVat" :value="true" />
                <span>{{ $t('stock.yes') }}</span>
              </label>
              <label class="radio-label">
                <input type="radio" v-model="addWithVat" :value="false" />
                <span>{{ $t('stock.no') }}</span>
              </label>
            </div>
          </div>
          <div class="form-field">
            <label class="form-label">{{ $t('common.notes') }} ({{ $t('common.optional') }})</label>
            <textarea v-model="addNotes" rows="3" class="form-textarea" :placeholder="$t('stock.notesPlaceholder')"></textarea>
          </div>
          <div class="current-stock-info">
            <div><span>{{ $t('stock.currentStock') }}: </span><strong>{{ selectedProduct?.quantity || 0 }} {{ $t('common.units') }}</strong></div>
            <div v-if="selectedProduct?.stock_with_vat !== undefined"><span>{{ $t('stock.currentWithVat') }}: </span><strong>{{ selectedProduct?.stock_with_vat || 0 }}</strong></div>
            <div v-if="selectedProduct?.stock_without_vat !== undefined"><span>{{ $t('stock.currentWithoutVat') }}: </span><strong>{{ selectedProduct?.stock_without_vat || 0 }}</strong></div>
            <div v-if="addQuantity > 0" class="after-add">
              <div>{{ $t('stock.afterAdd') }}:</div>
              <div>{{ $t('stock.totalStock') }}: {{ (selectedProduct?.quantity || 0) + addQuantity }}</div>
              <div v-if="addWithVat">{{ $t('stock.withVat') }}: {{ (selectedProduct?.stock_with_vat || 0) + addQuantity }}</div>
              <div v-else>{{ $t('stock.withoutVat') }}: {{ (selectedProduct?.stock_without_vat || 0) + addQuantity }}</div>
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeAddStock" class="btn-secondary">{{ $t('common.cancel') }}</button>
            <button type="submit" class="btn-primary" :disabled="addingStock">
              <span v-if="addingStock" class="spinner-small"></span>
              <span v-else>{{ $t('stock.addStock') }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Adjust Stock Modal -->
    <div v-if="showAdjustModal" class="modal-overlay" @click.self="closeAdjustStock">
      <div class="modal-container">
        <div class="modal-header">
          <h2 class="modal-title">{{ $t('stock.adjustStock') }}</h2>
          <button @click="closeAdjustStock" class="modal-close"><svg class="modal-close-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
        <div class="modal-product-info">
          <div class="product-icon">
            <svg class="product-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
          <div>
            <p class="product-name-modal">{{ selectedProduct?.product_name }}</p>
            <p class="product-sku-modal">{{ selectedProduct?.product_sku }}</p>
          </div>
        </div>
        <form @submit.prevent="adjustStock" class="modal-form">
          <div class="form-field">
            <label class="form-label">{{ $t('stock.newQuantity') }} *</label>
            <input v-model.number="adjustQuantity" type="number" step="1" min="0" class="form-input" required :placeholder="$t('stock.enterNewQuantity')" />
          </div>
          <div class="form-field">
            <label class="form-label">{{ $t('stock.reorderLevel') }} *</label>
            <input v-model.number="adjustReorderLevel" type="number" step="1" min="0" class="form-input" required :placeholder="$t('stock.reorderLevelPlaceholder')" />
            <small class="form-hint">{{ $t('stock.reorderHint') }}</small>
          </div>
          <div class="form-field">
            <label class="form-label">{{ $t('stock.adjustReason') }} *</label>
            <textarea v-model="adjustReason" rows="3" class="form-textarea" required :placeholder="$t('stock.adjustReasonPlaceholder')"></textarea>
          </div>
          <div class="current-stock-info">
            <div><span>{{ $t('stock.currentStock') }}: </span><strong>{{ selectedProduct?.quantity || 0 }} {{ $t('common.units') }}</strong></div>
            <div><span>{{ $t('stock.currentReorderLevel') }}: </span><strong>{{ selectedProduct?.reorder_level || 0 }} {{ $t('common.units') }}</strong></div>
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeAdjustStock" class="btn-secondary">{{ $t('common.cancel') }}</button>
            <button type="submit" class="btn-primary" :disabled="adjustingStock">
              <span v-if="adjustingStock" class="spinner-small"></span>
              <span v-else>{{ $t('stock.applyAdjustment') }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Stock History Modal -->
    <div v-if="showHistoryModal" class="modal-overlay modal-large" @click.self="closeHistoryModal">
      <div class="modal-container modal-large-container">
        <div class="modal-header">
          <h2 class="modal-title">{{ $t('stock.stockHistory') }}</h2>
          <button @click="closeHistoryModal" class="modal-close"><svg class="modal-close-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
        <div class="modal-product-info">
          <div class="product-icon">
            <svg class="product-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          </div>
          <div>
            <p class="product-name-modal">{{ historyProduct?.product_name }}</p>
            <p class="product-sku-modal">{{ historyProduct?.product_sku }}</p>
          </div>
        </div>
        <div class="history-filters">
          <select v-model="historyTypeFilter" class="filter-select-small">
            <option value="all">{{ $t('stock.allTransactions') }}</option>
            <option value="add">{{ $t('stock.stockAdditions') }}</option>
            <option value="adjust">{{ $t('stock.adjustments') }}</option>
          </select>
          <button @click="fetchStockHistory" class="refresh-btn-small">
            <svg class="refresh-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            {{ $t('common.refresh') }}
          </button>
        </div>
        <div v-if="historyLoading" class="history-loading">
          <div class="spinner-small"></div>
          <p>{{ $t('common.loading') }}</p>
        </div>
        <div v-else-if="stockHistory.length === 0" class="history-empty">
          <svg class="empty-svg-small" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          <p>{{ $t('stock.noHistory') }}</p>
        </div>
        <div v-else class="history-table-wrapper">
          <table class="history-table">
            <thead>
              <tr>
                <th>{{ $t('stock.dateTime') }}</th>
                <th>{{ $t('stock.type') }}</th>
                <th>{{ $t('stock.change') }}</th>
                <th>{{ $t('stock.vatStatus') }}</th>
                <th>{{ $t('stock.newQuantity') }}</th>
                <th>{{ $t('stock.reason') }}</th>
                <th>{{ $t('stock.user') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="record in filteredHistory" :key="record.id" :class="record.type">
                <td class="history-date-cell">{{ formatDate(record.created_at) }}</td>
                <td><span class="history-type-badge-table" :class="record.type">{{ record.type === 'add' ? $t('stock.stockAdded') : $t('stock.adjusted') }}</span></td>
                <td><span :class="record.quantity_change > 0 ? 'positive-change' : 'negative-change'">{{ record.quantity_change > 0 ? '+' : '' }}{{ record.quantity_change }}</span></td>
                <td><span :class="record.with_vat ? 'vat-badge-yes' : 'vat-badge-no'">{{ record.with_vat ? $t('stock.withVat') : $t('stock.withoutVat') }}</span></td>
                <td class="new-quantity-cell">{{ record.new_quantity || '-' }}</td>
                <td class="reason-cell">{{ record.reason || '-' }}</td>
                <td class="user-cell">{{ record.user_name || $t('stock.system') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="modal-actions">
          <button @click="closeHistoryModal" class="btn-secondary">{{ $t('common.close') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '@/services/api'

const { t } = useI18n()
const branches = ref([])
const selectedBranch = ref(null)
const stockData = ref([])
const lowStockOnly = ref(false)
const showAddModal = ref(false)
const showAdjustModal = ref(false)
const showHistoryModal = ref(false)
const selectedProduct = ref(null)
const historyProduct = ref(null)
const addQuantity = ref(0)
const addWithVat = ref(true)
const addNotes = ref('')
const adjustQuantity = ref(0)
const adjustReorderLevel = ref(0)
const adjustReason = ref('')
const loading = ref(false)
const addingStock = ref(false)
const adjustingStock = ref(false)
const historyLoading = ref(false)
const expandedGroups = ref(new Set())
const stockHistory = ref([])
const historyTypeFilter = ref('all')

const getSkuPrefix = (sku) => { const m = sku.match(/^[A-Za-z]+/); return m ? m[0] : sku }

const groupedStockData = computed(() => {
  const groups = new Map()
  stockData.value.forEach(item => {
    const prefix = getSkuPrefix(item.product_sku)
    if (!groups.has(prefix)) groups.set(prefix, { prefix, items: [], totalQuantity: 0, status: 'normal' })
    const g = groups.get(prefix); g.items.push(item); g.totalQuantity += item.quantity
    if (item.quantity === 0) g.status = 'out_of_stock'
    else if (item.quantity < item.reorder_level && g.status !== 'out_of_stock') g.status = 'low'
    else if (g.status !== 'out_of_stock' && g.status !== 'low') g.status = 'normal'
  })
  for (const g of groups.values()) g.items.sort((a, b) => a.product_sku.localeCompare(b.product_sku))
  return Array.from(groups.values()).sort((a, b) => a.prefix.localeCompare(b.prefix))
})

const filteredStockData = computed(() => lowStockOnly.value ? groupedStockData.value.filter(g => g.status !== 'normal') : groupedStockData.value)
const filteredHistory = computed(() => historyTypeFilter.value === 'all' ? stockHistory.value : stockHistory.value.filter(r => r.type === historyTypeFilter.value))
const lowStockGroupsCount = computed(() => groupedStockData.value.filter(g => g.status === 'low').length)
const outOfStockGroupsCount = computed(() => groupedStockData.value.filter(g => g.status === 'out_of_stock').length)
const totalStockValueFormatted = computed(() => { const t = stockData.value.reduce((s, i) => s + (i.quantity || 0), 0); return t >= 1e6 ? (t/1e6).toFixed(1)+'M' : t >= 1e3 ? (t/1e3).toFixed(1)+'K' : t.toString() })

const toggleGroup = (p) => { expandedGroups.value.has(p) ? expandedGroups.value.delete(p) : expandedGroups.value.add(p); expandedGroups.value = new Set(expandedGroups.value) }
const getGroupStatusBadge = (s) => ({ normal: 'status-normal', low: 'status-low', out_of_stock: 'status-out' }[s] || 'status-normal')
const getGroupStatusText = (s) => ({ normal: t('stock.normal'), low: t('stock.lowStock'), out_of_stock: t('products.outOfStock') }[s] || t('common.unknown'))
const addStockToGroup = (g) => { if (g.items.length > 0) openAddStock(g.items[0]) }
const getStockClass = (q) => { if (q === 0) return 'stock-critical'; if (q < 10) return 'stock-low'; return 'stock-normal' }
const getStockPercentage = (q, r) => { if (q === 0) return 0; if (!r || r === 0) return Math.min((q/100)*100, 100); return Math.min((q/(r*2))*100, 100) }
const getStatusBadge = (s) => ({ normal: 'status-normal', low: 'status-low', out_of_stock: 'status-out' }[s] || 'status-normal')
const getStatusText = (s) => ({ normal: t('stock.normal'), low: t('stock.lowStock'), out_of_stock: t('products.outOfStock') }[s] || t('common.unknown'))
const formatDate = (d) => d ? new Date(d).toLocaleString() : 'N/A'

const fetchBranches = async () => { try { branches.value = (await api.get('/branches')).data } catch (e) {} }
const fetchStock = async () => { if (!selectedBranch.value) return; loading.value = true; try { stockData.value = (await api.get(`/stock/${selectedBranch.value}`)).data } catch (e) { stockData.value = [] } finally { loading.value = false } }
const fetchStockHistory = async () => { if (!selectedBranch.value || !historyProduct.value) return; historyLoading.value = true; try { stockHistory.value = (await api.get(`/stock/${selectedBranch.value}/history/${historyProduct.value.product_id}`)).data || [] } catch (e) { stockHistory.value = [] } finally { historyLoading.value = false } }

const openAddStock = (i) => { selectedProduct.value = i; addQuantity.value = 0; addWithVat.value = true; addNotes.value = ''; showAddModal.value = true }
const closeAddStock = () => { showAddModal.value = false; selectedProduct.value = null }
const openAdjustStock = (i) => { selectedProduct.value = i; adjustQuantity.value = i.quantity; adjustReorderLevel.value = i.reorder_level || 10; adjustReason.value = ''; showAdjustModal.value = true }
const closeAdjustStock = () => { showAdjustModal.value = false; selectedProduct.value = null }
const openStockHistory = async (i) => { historyProduct.value = i; showHistoryModal.value = true; await fetchStockHistory() }
const closeHistoryModal = () => { showHistoryModal.value = false; historyProduct.value = null; stockHistory.value = []; historyTypeFilter.value = 'all' }

const addStock = async () => { 
  if (!addQuantity.value || addQuantity.value <= 0) { alert(t('stock.validQuantity')); return }
  addingStock.value = true
  try { 
    await api.post(`/stock/${selectedBranch.value}/${selectedProduct.value.product_id}/add`, null, { 
      params: { 
        quantity: addQuantity.value, 
        with_vat: addWithVat.value,
        notes: addNotes.value 
      } 
    })
    await fetchStock()
    closeAddStock()
    alert(t('stock.stockAdded'))
  } catch (e) { 
    alert(e.response?.data?.detail || t('stock.failedToAdd'))
  } finally { 
    addingStock.value = false 
  }
}

const adjustStock = async () => { 
  if (adjustQuantity.value === undefined || adjustQuantity.value < 0) { alert(t('stock.validQuantity')); return }
  if (adjustReorderLevel.value === undefined || adjustReorderLevel.value < 0) { alert(t('stock.validReorderLevel')); return }
  if (!adjustReason.value.trim()) { alert(t('stock.reasonRequired')); return }
  adjustingStock.value = true
  try { 
    await api.put(`/stock/${selectedBranch.value}/${selectedProduct.value.product_id}`, null, { 
      params: { 
        quantity: adjustQuantity.value, 
        reorder_level: adjustReorderLevel.value, 
        reason: adjustReason.value 
      } 
    })
    await fetchStock()
    closeAdjustStock()
    alert(t('stock.adjustSuccess'))
  } catch (e) { 
    alert(e.response?.data?.detail || t('stock.adjustFailed'))
  } finally { 
    adjustingStock.value = false 
  }
}

watch([selectedBranch, lowStockOnly], () => { if (selectedBranch.value) fetchStock() })
onMounted(() => { fetchBranches() })
</script>

<style scoped>
/* Stock Breakdown Styles */
.breakdown-cell {
  min-width: 160px;
}

.stock-breakdown {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
}

.breakdown-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2px 0;
}

.breakdown-item.vat-stock {
  color: #2FB8A6;
}

.breakdown-item.no-vat-stock {
  color: #6E8B90;
}

.breakdown-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 4px;
  margin-top: 4px;
  border-top: 1px dashed rgba(47, 184, 166, 0.3);
  font-weight: 600;
}

.breakdown-label {
  font-size: 11px;
  color: #6E8B90;
}

.breakdown-value {
  font-weight: 500;
  font-family: monospace;
}

.breakdown-value.total {
  color: #2FB8A6;
  font-weight: 700;
}

/* Radio Group Styles */
.radio-group {
  display: flex;
  gap: 20px;
  margin-top: 4px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #1A2A2E;
}

.radio-label input {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #2FB8A6;
}

/* VAT Badges in History */
.vat-badge-yes {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  background: rgba(47, 184, 166, 0.1);
  color: #2FB8A6;
}

.vat-badge-no {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  background: rgba(110, 139, 144, 0.1);
  color: #6E8B90;
}


/* Add these new styles for purchase cost column */
.purchase-cost-cell {
  min-width: 180px;
}

.cost-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
}

.cost-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.cost-label {
  color: #6E8B90;
  font-size: 11px;
}

.cost-value {
  font-weight: 500;
  color: #1A2A2E;
  font-family: monospace;
}

.vat-row {
  border-top: 1px dashed rgba(47, 184, 166, 0.2);
  padding-top: 4px;
  margin-top: 2px;
}

.vat-amount {
  color: #2FB8A6;
}

.cost-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 500;
  margin-top: 4px;
  text-align: center;
}

.cost-badge.has-vat {
  background: rgba(47, 184, 166, 0.1);
  color: #2FB8A6;
}

.cost-badge.no-vat {
  background: rgba(110, 139, 144, 0.1);
  color: #6E8B90;
}

.stock-quantity {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.reorder-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.status-cell {
  white-space: nowrap;
}


/* Add spinner-small style */
.spinner-small {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 0.5rem;
}

.form-hint {
  display: block;
  font-size: 0.7rem;
  color: #6E8B90;
  margin-top: 0.25rem;
}

.stock-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 0 2rem;
  animation: fadeIn 0.5s ease-out;
}

.header-section {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1A2A2E;
  margin-bottom: 0.25rem;
}

.page-subtitle {
  color: black;
  font-size: 0.9rem;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card-mini {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.stat-card-mini:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.8);
}

.stat-icon-mini {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-teal-100 {
  background-color: rgba(47, 184, 166, 0.1);
}
.bg-orange-100 {
  background-color: rgba(249, 115, 22, 0.1);
}
.bg-red-100 {
  background-color: rgba(239, 68, 68, 0.1);
}
.bg-green-100 {
  background-color: rgba(52, 211, 153, 0.1);
}
.text-teal-600 {
  color: #2FB8A6;
}
.text-orange-600 {
  color: #F97316;
}
.text-red-600 {
  color: #EF4444;
}
.text-green-600 {
  color: #34D399;
}

.stat-mini-svg {
  width: 20px;
  height: 20px;
}

.stat-value-mini {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1A2A2E;
  line-height: 1.2;
}

.stat-label-mini {
  font-size: 0.75rem;
  color: black;
}

.branch-selector {
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.selector-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.selector-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, rgba(47, 184, 166, 0.1), rgba(111, 211, 195, 0.1));
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2FB8A6;
}

.selector-svg-icon {
  width: 22px;
  height: 22px;
}

.selector-inputs {
  flex: 1;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
}

.branch-select {
  flex: 1;
  min-width: 200px;
  padding: 0.75rem 1rem;
  border: 1px solid rgba(47, 184, 166, 0.2);
  border-radius: 12px;
  background: white;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.branch-select:focus {
  outline: none;
  border-color: #2FB8A6;
  box-shadow: 0 0 0 3px rgba(47, 184, 166, 0.1);
}

.low-stock-filter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.85rem;
  color: black;
  white-space: nowrap;
}

.low-stock-filter input {
  width: 1rem;
  height: 1rem;
  cursor: pointer;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(110, 139, 144, 0.1);
  border: 1px solid rgba(110, 139, 144, 0.2);
  border-radius: 12px;
  color: black;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.refresh-svg-icon {
  width: 14px;
  height: 14px;
}

.refresh-btn:hover {
  background: rgba(110, 139, 144, 0.2);
}

.empty-state {
  text-align: center;
  padding: 3rem;
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.empty-svg-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1rem;
  color: black;
}

.empty-state h3 {
  font-size: 1.2rem;
  color: #1A2A2E;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: black;
}

.stock-table-container {
  overflow: hidden;
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.table-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1A2A2E;
}

.table-count {
  font-size: 0.8rem;
  color: black;
  background: rgba(110, 139, 144, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
}

.overflow-x-auto {
  overflow-x: auto;
}

.stock-table {
  width: 100%;
  border-collapse: collapse;
}

.stock-table th {
  text-align: left;
  padding: 1rem 1rem;
  background: rgba(47, 184, 166, 0.05);
  color: black;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stock-row {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  transition: background 0.2s ease;
}

.stock-row:hover {
  background: rgba(47, 184, 166, 0.03);
}

.stock-row td {
  padding: 1rem;
  vertical-align: middle;
}

.product-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.product-name {
  font-weight: 600;
  color: #1A2A2E;
}

.product-category {
  font-size: 0.7rem;
  color: black;
}

.sku-cell {
  font-family: monospace;
  font-size: 0.85rem;
  color: black;
}

.stock-cell {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 100px;
}

.stock-value {
  font-weight: 500;
  font-size: 0.85rem;
}

.stock-critical {
  color: #EF4444;
}

.stock-low {
  color: #F97316;
}

.stock-normal {
  color: #34D399;
}

.stock-bar {
  width: 100%;
  height: 4px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.stock-fill {
  height: 100%;
  background: linear-gradient(90deg, #2FB8A6, #6FD3C3);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.reorder-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.reorder-value {
  font-size: 0.85rem;
  color: black;
}

.quick-restock {
  padding: 0.25rem 0.5rem;
  background: rgba(47, 184, 166, 0.1);
  border: none;
  border-radius: 6px;
  color: #2FB8A6;
  font-size: 0.7rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-restock:hover {
  background: rgba(47, 184, 166, 0.2);
  transform: scale(1.05);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-normal {
  background: rgba(52, 211, 153, 0.1);
  color: #34D399;
}

.status-low {
  background: rgba(249, 115, 22, 0.1);
  color: #F97316;
}

.status-out {
  background: rgba(239, 68, 68, 0.1);
  color: #EF4444;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status-dot.normal {
  background: #34D399;
}

.status-dot.low {
  background: #F97316;
}

.status-dot.out_of_stock {
  background: #EF4444;
}

.actions-cell {
  text-align: right;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-svg-icon {
  width: 14px;
  height: 14px;
}

.add-stock-btn {
  background: linear-gradient(135deg, #2FB8A6, #6FD3C3);
  color: white;
}

.add-stock-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(47, 184, 166, 0.2);
}

.history-btn {
  background: rgba(59, 130, 246, 0.1);
  color: #3B82F6;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.history-btn:hover {
  background: rgba(59, 130, 246, 0.2);
  transform: translateY(-1px);
}

.adjust-btn {
  background: rgba(245, 158, 11, 0.1);
  color: #F59E0B;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.adjust-btn:hover {
  background: rgba(245, 158, 11, 0.2);
  transform: translateY(-1px);
}

.empty-table-state {
  text-align: center;
  padding: 3rem !important;
  color: black;
}

.empty-svg-small {
  width: 48px;
  height: 48px;
  margin: 0 auto 1rem;
  color: black;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
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
  border-radius: 24px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease;
}

.modal-large-container {
  max-width: 700px !important;
  width: 90% !important;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1A2A2E;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  color: black;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close-svg {
  width: 18px;
  height: 18px;
}

.modal-close:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #1A2A2E;
}

.modal-product-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: rgba(47, 184, 166, 0.05);
  margin: 1rem 1.5rem;
  border-radius: 16px;
}

.product-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, rgba(47, 184, 166, 0.1), rgba(111, 211, 195, 0.1));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2FB8A6;
}

.product-svg-icon {
  width: 24px;
  height: 24px;
}

.product-name-modal {
  font-weight: 600;
  color: #1A2A2E;
  margin-bottom: 0.25rem;
}

.product-sku-modal {
  font-size: 0.7rem;
  color: black;
}

.modal-form {
  padding: 0 1.5rem 1.5rem;
}

.form-field {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 500;
  color: #1A2A2E;
  margin-bottom: 0.5rem;
}

.form-input,
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
.form-textarea:focus {
  outline: none;
  border-color: #2FB8A6;
  box-shadow: 0 0 0 3px rgba(47, 184, 166, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.current-stock-info {
  padding: 0.75rem;
  background: rgba(110, 139, 144, 0.05);
  border-radius: 12px;
  font-size: 0.85rem;
  color: black;
  margin-bottom: 1rem;
}

.current-stock-info strong {
  color: #1A2A2E;
}

.current-stock-info .after-add {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.current-stock-info .increase {
  color: #34D399;
}

.current-stock-info .decrease {
  color: #F97316;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

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
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-svg-icon {
  width: 16px;
  height: 16px;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(47, 184, 166, 0.3);
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  background: rgba(110, 139, 144, 0.1);
  border: 1px solid rgba(110, 139, 144, 0.2);
  border-radius: 12px;
  color: black;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: rgba(110, 139, 144, 0.2);
}

.group-row {
  cursor: pointer;
  background: rgba(47, 184, 166, 0.03);
  border-bottom: 1px solid rgba(47, 184, 166, 0.1);
}

.group-row:hover {
  background: rgba(47, 184, 166, 0.08);
}

.group-header {
  padding: 0.75rem 1rem !important;
}

.group-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.group-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.group-icon {
  width: 18px;
  height: 18px;
  transition: transform 0.2s ease;
  color: #2FB8A6;
}

.group-icon.rotated {
  transform: rotate(90deg);
}

.group-prefix {
  font-weight: 700;
  font-size: 1rem;
  color: #1A2A2E;
  font-family: monospace;
}

.group-count {
  font-size: 0.8rem;
  color: #6E8B90;
}

.group-total-stock {
  font-size: 0.8rem;
  color: #2FB8A6;
  font-weight: 500;
}

.group-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.sub-stock-row {
  background: rgba(255, 255, 255, 0.5);
}

.sub-stock-row:hover {
  background: rgba(47, 184, 166, 0.03);
}

.sub-product {
  padding-left: 2rem !important;
}

.sub-sku {
  padding-left: 2rem !important;
}

/* History Table Styles */
.history-table-wrapper {
  padding: 0 1.5rem 1.5rem;
  overflow-x: auto;
  max-height: 450px;
  overflow-y: auto;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.history-table thead {
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
}

.history-table th {
  text-align: left;
  padding: 0.75rem 0.5rem;
  background: rgba(47, 184, 166, 0.1);
  color: #1A2A2E;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid rgba(47, 184, 166, 0.2);
}

.history-table td {
  padding: 0.75rem 0.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  vertical-align: middle;
}

.history-table tbody tr:hover {
  background: rgba(47, 184, 166, 0.03);
}

.history-table tbody tr.add {
  border-left: 3px solid #34D399;
}

.history-table tbody tr.adjust {
  border-left: 3px solid #F59E0B;
}

.history-date-cell {
  font-size: 0.75rem;
  color: #6E8B90;
  white-space: nowrap;
}

.history-type-badge-table {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 500;
}

.history-type-badge-table.add {
  background: rgba(52, 211, 153, 0.1);
  color: #34D399;
}

.history-type-badge-table.adjust {
  background: rgba(245, 158, 11, 0.1);
  color: #F59E0B;
}

.positive-change {
  color: #34D399;
  font-weight: 600;
}

.negative-change {
  color: #EF4444;
  font-weight: 600;
}

.new-quantity-cell {
  font-weight: 500;
  color: #1A2A2E;
}

.reason-cell {
  color: #6E8B90;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-cell {
  color: #2FB8A6;
  font-weight: 500;
  white-space: nowrap;
}

.history-filters {
  display: flex;
  gap: 1rem;
  padding: 0 1.5rem 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.filter-select-small {
  padding: 0.5rem 1rem;
  border: 1px solid rgba(47, 184, 166, 0.2);
  border-radius: 10px;
  background: white;
  font-size: 0.85rem;
  cursor: pointer;
}

.refresh-btn-small {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(110, 139, 144, 0.1);
  border: 1px solid rgba(110, 139, 144, 0.2);
  border-radius: 10px;
  color: black;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.refresh-btn-small:hover {
  background: rgba(110, 139, 144, 0.2);
}

.history-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
}

.history-empty {
  text-align: center;
  padding: 3rem;
  color: #6E8B90;
}

.history-empty .empty-svg-small {
  width: 48px;
  height: 48px;
  margin: 0 auto 1rem;
  color: #6E8B90;
}

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

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .selector-inputs {
    flex-direction: column;
    align-items: stretch;
  }
  
  .branch-select {
    width: 100%;
  }
  
  .low-stock-filter {
    justify-content: flex-start;
  }
  
  .refresh-btn {
    justify-content: center;
  }
  
  .stock-table {
    font-size: 0.85rem;
  }
  
  .stock-table th,
  .stock-table td {
    padding: 0.75rem;
  }
  
  .action-btn span {
    display: none;
  }
  
  .action-btn {
    padding: 0.5rem;
  }
  
  .action-svg-icon {
    width: 16px;
    height: 16px;
  }
  
  .modal-large-container {
    width: 95% !important;
  }
  
  .history-table {
    font-size: 0.75rem;
  }
  
  .history-table th,
  .history-table td {
    padding: 0.5rem 0.25rem;
  }
  
  .reason-cell {
    max-width: 120px;
  }
  
  .history-date-cell {
    font-size: 0.7rem;
  }
}

@media (max-width: 640px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stock-table {
    display: block;
    overflow-x: auto;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .action-btn {
    justify-content: center;
  }
  
  .history-table-wrapper {
    padding: 0 1rem 1rem;
  }
  
  .reason-cell {
    max-width: 80px;
  }
}

@media (max-width: 480px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .selector-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .selector-icon {
    display: none;
  }
}
</style>