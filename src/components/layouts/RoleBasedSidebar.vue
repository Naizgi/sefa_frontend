<template>
  <aside class="sidebar" :class="{ 
    'sidebar-collapsed': collapsed && !isMobile, 
    'sidebar-expanded': !collapsed && !isMobile,
    'sidebar-open': mobileOpen 
  }">
    <!-- Mobile Overlay -->
    <div class="mobile-overlay" v-if="mobileOpen && isMobile" @click="closeMobileMenu"></div>

    <!-- Sidebar Content -->
    <div class="sidebar-container" :class="{ 'mobile-open': mobileOpen && isMobile }">
      <!-- Header with Logo and Toggle -->
      <div class="sidebar-header">
        <div class="logo-section" :class="{ 'collapsed': collapsed && !isMobile }">
          <div class="logo-wrapper">
            <svg class="logo-icon" viewBox="0 0 24 24" fill="none">
              <path d="M20 7L12 3L4 7L12 11L20 7Z" stroke="currentColor" stroke-width="1.5"/>
              <path d="M4 7V17L12 21L20 17V7" stroke="currentColor" stroke-width="1.5"/>
              <path d="M12 11V21" stroke="currentColor" stroke-width="1.5"/>
            </svg>
          </div>
          <div class="logo-text" v-if="!collapsed || (isMobile && mobileOpen)">
            <h1 class="logo-title">{{ $t('common.appName') }}</h1>
            <p class="logo-subtitle">{{ $t('common.stockManagement') }}</p>
          </div>
        </div>

        <!-- Desktop Collapse Button -->
        <button class="collapse-btn" @click="toggleSidebar" v-if="!isMobile">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              :d="collapsed ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'" />
          </svg>
        </button>
      </div>

      <!-- User Profile -->
      <div class="user-section" :class="{ 'collapsed': collapsed && !isMobile }">
        <div class="profile-avatar" :style="avatarStyle">
          {{ userInitials }}
        </div>
        <div class="profile-info" v-if="!collapsed || (isMobile && mobileOpen)">
          <h3 class="profile-name">{{ user?.name || user?.username || $t('common.guestUser') }}</h3>
          <p class="profile-role">{{ formatRole(user?.role) }}</p>
          <div class="profile-status">
            <span class="status-dot"></span>
            <span class="status-text">{{ $t('common.online') }}</span>
          </div>
        </div>
      </div>

      <!-- Navigation Menu -->
      <nav class="nav-menu" :class="{ 'collapsed': collapsed && !isMobile }">
        <!-- Main Menu -->
        <div class="menu-group">
          <div class="menu-label" v-if="!collapsed || (isMobile && mobileOpen)">{{ $t('sidebar.main') }}</div>
          
          <router-link :to="getDashboardRoute()" class="menu-item" active-class="active" @click="closeMobileMenu">
            <div class="item-icon">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <span class="item-text" v-if="!collapsed || (isMobile && mobileOpen)">{{ $t('sidebar.dashboard') }}</span>
          </router-link>
        </div>

        <!-- Admin Menu (Only Admin) -->
        <template v-if="isAdmin">
          <div class="menu-group">
            <div class="menu-label" v-if="!collapsed || (isMobile && mobileOpen)">{{ $t('sidebar.management') }}</div>
            
            <router-link to="/products" class="menu-item" active-class="active" @click="closeMobileMenu">
              <div class="item-icon">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <span class="item-text" v-if="!collapsed || (isMobile && mobileOpen)">{{ $t('sidebar.products') }}</span>
            </router-link>
            
            <router-link to="/branches" class="menu-item" active-class="active" @click="closeMobileMenu">
              <div class="item-icon">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span class="item-text" v-if="!collapsed || (isMobile && mobileOpen)">{{ $t('sidebar.branches') }}</span>
            </router-link>
            
            <router-link to="/stock" class="menu-item" active-class="active" @click="closeMobileMenu">
              <div class="item-icon">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <span class="item-text" v-if="!collapsed || (isMobile && mobileOpen)">{{ $t('sidebar.inventory') }}</span>
            </router-link>
            
            <router-link to="/users" class="menu-item" active-class="active" @click="closeMobileMenu">
              <div class="item-icon">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <span class="item-text" v-if="!collapsed || (isMobile && mobileOpen)">{{ $t('sidebar.users') }}</span>
            </router-link>
          </div>

          <!-- PURCHASE SECTION - Admin Only -->
          <div class="menu-group">
            <div class="menu-label" v-if="!collapsed || (isMobile && mobileOpen)">{{ $t('sidebar.purchasing') }}</div>
            
            <router-link to="/purchases" class="menu-item" active-class="active" @click="closeMobileMenu">
              <div class="item-icon">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 12v6m-3-3h6" />
                </svg>
              </div>
              <span class="item-text" v-if="!collapsed || (isMobile && mobileOpen)">{{ $t('sidebar.purchases') }}</span>
            </router-link>
            
            <router-link to="/purchases/create" class="menu-item" active-class="active" @click="closeMobileMenu">
              <div class="item-icon">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span class="item-text" v-if="!collapsed || (isMobile && mobileOpen)">{{ $t('sidebar.newPurchaseOrder') }}</span>
            </router-link>
          </div>

          <!-- LOAN SECTION - Admin Only -->
          <div class="menu-group">
            <div class="menu-label" v-if="!collapsed || (isMobile && mobileOpen)">{{ $t('sidebar.loans') }}</div>
            
            <router-link to="/loans" class="menu-item" active-class="active" @click="closeMobileMenu">
              <div class="item-icon">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm0 0v4" />
                </svg>
              </div>
              <span class="item-text" v-if="!collapsed || (isMobile && mobileOpen)">{{ $t('sidebar.allLoans') }}</span>
            </router-link>
            
            <router-link to="/loans/create" class="menu-item" active-class="active" @click="closeMobileMenu">
              <div class="item-icon">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <span class="item-text" v-if="!collapsed || (isMobile && mobileOpen)">{{ $t('sidebar.newLoan') }}</span>
            </router-link>
          </div>

          <!-- TEMP ITEMS SECTION - ADMIN -->
          <div class="menu-group">
            <div class="menu-label" v-if="!collapsed || (isMobile && mobileOpen)">{{ $t('sidebar.itemRegistration') }}</div>
            
            <router-link to="/temp-items" class="menu-item" active-class="active" @click="closeMobileMenu">
              <div class="item-icon">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span class="item-text" v-if="!collapsed || (isMobile && mobileOpen)">{{ $t('sidebar.pendingApprovals') }}</span>
            </router-link>
          </div>
        </template>

        <!-- Salesman AND Privileged Sales Menu -->
        <template v-if="isSalesRole">
          <div class="menu-group">
            <div class="menu-label" v-if="!collapsed || (isMobile && mobileOpen)">{{ $t('sidebar.sales') }}</div>
            
            <router-link to="/sales" class="menu-item" active-class="active" @click="closeMobileMenu">
              <div class="item-icon">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span class="item-text" v-if="!collapsed || (isMobile && mobileOpen)">{{ $t('sidebar.sales') }}</span>
            </router-link>
            
            <router-link to="/sales/pos" class="menu-item" active-class="active" @click="closeMobileMenu">
              <div class="item-icon">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span class="item-text" v-if="!collapsed || (isMobile && mobileOpen)">{{ $t('sidebar.pos') }}</span>
            </router-link>
            
            <router-link to="/sales/products" class="menu-item" active-class="active" @click="closeMobileMenu">
              <div class="item-icon">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <span class="item-text" v-if="!collapsed || (isMobile && mobileOpen)">{{ $t('sidebar.products') }}</span>
            </router-link>
            
            <router-link to="/sales/stock" class="menu-item" active-class="active" @click="closeMobileMenu">
              <div class="item-icon">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <span class="item-text" v-if="!collapsed || (isMobile && mobileOpen)">{{ $t('sidebar.inventory') }}</span>
            </router-link>
          </div>

          <!-- TEMP ITEMS SECTION - For both salesman and privileged_sales -->
          <div class="menu-group">
            <div class="menu-label" v-if="!collapsed || (isMobile && mobileOpen)">{{ $t('sidebar.itemRegistration') }}</div>
            
            <router-link to="/sales/temp-items" class="menu-item" active-class="active" @click="closeMobileMenu">
              <div class="item-icon">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span class="item-text" v-if="!collapsed || (isMobile && mobileOpen)">{{ $t('sidebar.registerItem') }}</span>
            </router-link>
          </div>

          <!-- PRIVILEGED SALES ONLY: Loan Section -->
          <div class="menu-group" v-if="isPrivilegedSales">
            <div class="menu-label" v-if="!collapsed || (isMobile && mobileOpen)">{{ $t('sidebar.customerLoans') }}</div>
            
            <router-link to="/sales/loans" class="menu-item" active-class="active" @click="closeMobileMenu">
              <div class="item-icon">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm0 0v4" />
                </svg>
              </div>
              <span class="item-text" v-if="!collapsed || (isMobile && mobileOpen)">{{ $t('sidebar.customerLoans') }}</span>
            </router-link>
            
            <router-link to="/sales/loans/create" class="menu-item" active-class="active" @click="closeMobileMenu">
              <div class="item-icon">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <span class="item-text" v-if="!collapsed || (isMobile && mobileOpen)">{{ $t('sidebar.createLoan') }}</span>
            </router-link>

            <router-link to="/sales/refund" class="menu-item" active-class="active" @click="closeMobileMenu">
              <div class="item-icon">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 4V9a2 2 0 00-2-2h-1M3 15h1a4 4 0 004-4v-1m0 0l-3 3m3-3l-3-3" />
                </svg>
              </div>
              <span class="item-text" v-if="!collapsed || (isMobile && mobileOpen)">{{ $t('sidebar.processRefund') }}</span>
            </router-link>
          </div>
        </template>

        <!-- Reports Section - Admin Only -->
        <div class="menu-group" v-if="isAdmin">
          <div class="menu-label" v-if="!collapsed || (isMobile && mobileOpen)">{{ $t('sidebar.reports') }}</div>
          
          <router-link to="/reports" class="menu-item" active-class="active" @click="closeMobileMenu">
            <div class="item-icon">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span class="item-text" v-if="!collapsed || (isMobile && mobileOpen)">{{ $t('sidebar.reports') }}</span>
          </router-link>
          
          <router-link to="/allreports" class="menu-item" active-class="active" @click="closeMobileMenu">
            <div class="item-icon">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span class="item-text" v-if="!collapsed || (isMobile && mobileOpen)">{{ $t('sidebar.allReports') }}</span>
          </router-link>

          <router-link to="/alerts" class="menu-item" active-class="active" @click="closeMobileMenu">
            <div class="item-icon">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span class="notification-badge" v-if="activeAlerts > 0">{{ activeAlerts > 99 ? '99+' : activeAlerts }}</span>
            </div>
            <span class="item-text" v-if="!collapsed || (isMobile && mobileOpen)">{{ $t('sidebar.stockAlerts') }}</span>
          </router-link>
        </div>

        <!-- Settings Section - Admin Only -->
        <div class="menu-group" v-if="isAdmin">
          <div class="menu-label" v-if="!collapsed || (isMobile && mobileOpen)">{{ $t('sidebar.system') }}</div>
          
          <router-link to="/settings" class="menu-item" active-class="active" @click="closeMobileMenu">
            <div class="item-icon">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span class="item-text" v-if="!collapsed || (isMobile && mobileOpen)">{{ $t('sidebar.settings') }}</span>
          </router-link>
        </div>

        <!-- Account Menu (Everyone) -->
        <div class="menu-group">
          <div class="menu-label" v-if="!collapsed || (isMobile && mobileOpen)">{{ $t('sidebar.account') }}</div>
          
          <router-link to="/profile" class="menu-item" active-class="active" @click="closeMobileMenu">
            <div class="item-icon">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span class="item-text" v-if="!collapsed || (isMobile && mobileOpen)">{{ $t('sidebar.profile') }}</span>
          </router-link>
          
          <a href="#" class="menu-item" @click.prevent="logout">
            <div class="item-icon">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <span class="item-text" v-if="!collapsed || (isMobile && mobileOpen)">{{ $t('sidebar.logout') }}</span>
          </a>
        </div>
      </nav>

      <!-- Language Switcher -->
      <div class="language-section" :class="{ 'collapsed': collapsed && !isMobile }">
        <LanguageSwitcher />
      </div>

      <!-- Version Info -->
      <div class="version-info" :class="{ 'collapsed': collapsed && !isMobile }">
        <div class="version-badge" v-if="!collapsed || (isMobile && mobileOpen)">
          <span>{{ $t('sidebar.version') }} v2.0.0</span>
        </div>
        <span v-else>v2.0</span>
      </div>
    </div>

    <!-- Mobile Menu Button -->
    <button class="mobile-menu-btn" @click="toggleMobileMenu" :class="{ 'active': mobileOpen }">
      <span></span>
      <span></span>
      <span></span>
    </button>
  </aside>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useI18n } from 'vue-i18n'
import api from '@/services/api'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'

const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

const collapsed = ref(false)
const mobileOpen = ref(false)
const isMobile = ref(window.innerWidth <= 768)
const activeAlerts = ref(0)

const fetchAlertCount = async () => {
  try {
    const response = await api.get('/alerts', { params: { resolved: false } })
    activeAlerts.value = response.data?.length || 0
  } catch (error) {
    console.error('Failed to fetch alerts count:', error)
    activeAlerts.value = 0
  }
}

const user = computed(() => authStore.user)
const isAdmin = computed(() => authStore.isAdmin)
const isPrivilegedSales = computed(() => authStore.user?.role === 'privileged_sales')
const isSalesman = computed(() => authStore.isSalesman)
const isSalesRole = computed(() => isSalesman.value || isPrivilegedSales.value)

const getDashboardRoute = () => {
  const role = authStore.user?.role
  const routes = { 
    admin: '/dashboard', 
    salesman: '/sales',
    privileged_sales: '/sales' 
  }
  return routes[role] || '/dashboard'
}

const userInitials = computed(() => {
  if (!user.value?.name) return 'GU'
  return user.value.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
})

const avatarStyle = computed(() => ({ background: `linear-gradient(135deg, #2FB8A6, #6FD3C3)` }))

const formatRole = (role) => {
  if (!role) return ''
  const roles = { 
    admin: t('sidebar.administrator'), 
    salesman: t('sidebar.salesAssociate'),
    privileged_sales: t('sidebar.privilegedSales')
  }
  return roles[role] || role
}

const toggleSidebar = () => { collapsed.value = !collapsed.value }
const toggleMobileMenu = () => { mobileOpen.value = !mobileOpen.value }

const handleToggleSidebar = (event) => {
  mobileOpen.value = event.detail.open
  if (mobileOpen.value) document.body.style.overflow = 'hidden'
  else document.body.style.overflow = ''
}

const closeMobileMenu = () => { mobileOpen.value = false; document.body.style.overflow = '' }

const logout = async () => { await authStore.logout(); router.push('/login') }

const handleResize = () => {
  isMobile.value = window.innerWidth <= 768
  if (!isMobile.value && mobileOpen.value) closeMobileMenu()
}

const handleEscape = (e) => { if (e.key === 'Escape' && mobileOpen.value) closeMobileMenu() }

onMounted(() => {
  window.addEventListener('resize', handleResize)
  document.addEventListener('keydown', handleEscape)
  window.addEventListener('toggle-sidebar', handleToggleSidebar)
  const savedState = localStorage.getItem('sidebar_collapsed')
  if (savedState !== null && !isMobile.value) collapsed.value = JSON.parse(savedState)
  fetchAlertCount()
  const interval = setInterval(fetchAlertCount, 30000)
  onUnmounted(() => { clearInterval(interval) })
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('keydown', handleEscape)
  window.removeEventListener('toggle-sidebar', handleToggleSidebar)
  document.body.style.overflow = ''
})

watch(collapsed, (val) => { if (!isMobile.value) localStorage.setItem('sidebar_collapsed', JSON.stringify(val)) })
</script>



<style scoped>
/* ============================================
   TEAL GLASSMORPHISM SIDEBAR
   ============================================ */

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 800;
}

.sidebar-container {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 280px;
  background: rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  border-right: 1px solid rgba(255, 255, 255, 0.3);
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1001;
}

@media (min-width: 769px) {
  .sidebar-collapsed .sidebar-container {
    width: 80px;
  }
  
  .sidebar-collapsed .logo-text,
  .sidebar-collapsed .profile-info,
  .sidebar-collapsed .item-text,
  .sidebar-collapsed .menu-label,
  .sidebar-collapsed .version-badge {
    display: none;
  }
  
  .sidebar-collapsed .logo-section {
    justify-content: center;
    width: 100%;
  }
  
  .sidebar-collapsed .user-section {
    justify-content: center;
    padding: 20px 0;
  }
  
  .sidebar-collapsed .menu-item {
    justify-content: center;
    padding: 12px 0;
  }
  
  .sidebar-collapsed .item-icon {
    margin-right: 0;
  }
}

@media (max-width: 768px) {
  .sidebar-container {
    transform: translateX(-100%);
    width: 280px;
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 2px 0 20px rgba(0, 0, 0, 0.1);
  }
  
  .sidebar-container.mobile-open {
    transform: translateX(0);
  }
}

.mobile-menu-btn {
  position: fixed;
  top: 16px;
  left: 16px;
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #2FB8A6, #6FD3C3);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  z-index: 1009 !important;
  display: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  box-shadow: 0 4px 12px rgba(47, 184, 166, 0.3);
  transition: all 0.3s ease;
}

@media (max-width: 768px) {
  .mobile-menu-btn {
    display: flex !important;
  }
}

.mobile-menu-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(47, 184, 166, 0.4);
}

.mobile-menu-btn:active {
  transform: scale(0.98);
}

.mobile-menu-btn span {
  width: 22px;
  height: 2px;
  background: white;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.mobile-menu-btn.active span:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.mobile-menu-btn.active span:nth-child(2) {
  opacity: 0;
}

.mobile-menu-btn.active span:nth-child(3) {
  transform: rotate(-45deg) translate(5px, -5px);
}

.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.sidebar-header {
  padding: 24px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
}

.logo-wrapper {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #2FB8A6, #6FD3C3);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(47, 184, 166, 0.2);
}

.logo-icon {
  width: 24px;
  height: 24px;
}

.logo-title {
  font-size: 1rem;
  font-weight: 700;
  color: #1A2A2E;
  margin: 0;
  line-height: 1.2;
}

.logo-subtitle {
  font-size: 0.6rem;
  color: #2FB8A6;
  margin: 0;
}

.collapse-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #2FB8A6;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.collapse-btn:hover {
  background: linear-gradient(135deg, #2FB8A6, #6FD3C3);
  color: white;
  transform: scale(1.05);
  border-color: transparent;
}

.user-section {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
}

.profile-avatar {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.profile-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1A2A2E;
  margin: 0 0 2px;
}

.profile-role {
  font-size: 0.7rem;
  color: #2FB8A6;
  margin: 0 0 4px;
  font-weight: 500;
}

.profile-status {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 6px;
  height: 6px;
  background: #34D399;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.status-text {
  font-size: 0.65rem;
  color: black;
}

.nav-menu {
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
}

.nav-menu::-webkit-scrollbar {
  width: 4px;
}

.nav-menu::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.nav-menu::-webkit-scrollbar-thumb {
  background: #2FB8A6;
  border-radius: 4px;
}

.menu-group {
  margin-bottom: 16px;
}

.menu-label {
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: black;
  padding: 0 20px 8px;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  color: black;
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
  margin: 2px 0;
  border-radius: 0 12px 12px 0;
}

.menu-item:hover {
  background: rgba(47, 184, 166, 0.1);
  color: #2FB8A6;
}

.menu-item.active {
  background: #2FB8A6;
  color: white;
  box-shadow: 0 4px 12px rgba(47, 184, 166, 0.3);
}

.menu-item.active .item-icon svg {
  stroke: white;
}

.item-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  position: relative;
  flex-shrink: 0;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.menu-item:hover .item-icon {
  transform: scale(1.05);
}

.item-icon svg {
  width: 18px;
  height: 18px;
  stroke: currentColor;
}

.item-text {
  font-size: 0.85rem;
  font-weight: 500;
}

.notification-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #EF4444;
  color: white;
  border-radius: 50%;
  min-width: 18px;
  height: 18px;
  font-size: 0.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  padding: 0 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  animation: badgePulse 2s infinite;
}

/* Language Section */
.language-section {
  padding: 12px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  display: flex;
  justify-content: center;
}

.language-section.collapsed {
  padding: 12px 8px;
}

.version-info {
  padding: 12px 20px 16px;
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  font-size: 0.7rem;
  color: black;
}

.version-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #2FB8A6;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.95); }
}

@keyframes badgePulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 4px rgba(239, 68, 68, 0);
  }
}

@media (max-width: 480px) {
  .sidebar-container {
    width: 100%;
    max-width: 300px;
  }
  
  .mobile-menu-btn {
    top: 12px;
    left: 12px;
    width: 40px;
    height: 40px;
  }
  
  .sidebar-header {
    padding: 20px 16px;
  }
  
  .user-section {
    padding: 16px;
  }
  
  .menu-item {
    padding: 10px 16px;
  }
  
  .menu-label {
    padding: 0 16px 6px;
  }
}

@media (max-height: 600px) and (orientation: landscape) {
  .nav-menu {
    max-height: calc(100vh - 200px);
  }
  
  .user-section {
    padding: 12px;
  }
  
  .profile-avatar {
    width: 36px;
    height: 36px;
    font-size: 0.9rem;
  }
}

@media (hover: none) and (pointer: coarse) {
  .menu-item {
    padding: 12px 20px;
  }
  
  .collapse-btn {
    min-width: 44px;
    min-height: 44px;
  }
}
</style>