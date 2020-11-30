import Vue from 'vue';
import Router, { Route, RouteRecord } from 'vue-router';

import store from './store';

import BudgetPage from './pages/BudgetPage.vue';
import DashboardPage from './pages/DashboardPage.vue';
import LoginPage from './pages/LoginPage.vue';
import SetupPage from './pages/SetupPage.vue';
import TransactionPage from './pages/TransactionPage.vue';
import UserOnboardPage from './pages/UserOnboardPage.vue';

Vue.use(Router);

const router = new Router({
  linkActiveClass: 'navbar-button__active',
  mode: 'history',
  routes: [
    // Server Setup Page
    {
      path: '/setup',
      component: SetupPage,
      meta: {
        title: 'Server Setup',
      },
    },

    // Login and Logout Pages
    {
      path: '/login',
      component: LoginPage,
      meta: {
        title: 'Login',
      },
    },

    // Onboarding Page
    {
      path: '/onboard',
      component: UserOnboardPage,
      meta: {
        title: 'Welcome',
        requiresLogin: true,
      },
    },

    // Protected Pages
    {
      path: '/home',
      component: DashboardPage,
      meta: {
        title: 'Dashboard',
        requiresLogin: true,
        requiresProfile: true,
      },
    },
    {
      path: '/budget',
      component: BudgetPage,
      meta: {
        title: 'Budget',
        requiresLogin: true,
        requiresProfile: true,
      },
    },
    {
      path: '/transactions',
      component: TransactionPage,
      meta: {
        title: 'Transactions',
        requiresLogin: true,
        requiresProfile: true,
      },
    },

    // Redirect to home by default
    { path: '*', redirect: '/home' },
  ],
});

const metaHas = (to: Route, field: string): boolean => to.matched.some(
  (r: RouteRecord) => r.meta && r.meta[field],
);

// Login and Onboarding Guards
router.beforeEach((to, from, next) => {
  const { loggedIn, needsSetup, user } = store.getters;

  if (needsSetup) {
    // Redirect for Server Setup
    if (to.path !== '/setup') {
      next('/setup');
    } else {
      next();
    }
  } else if (metaHas(to, 'requiresLogin') && !loggedIn) {
    // Redirect for Login
    if (to.path === '/login') {
      next();
    } else {
      next({
        path: '/login',
        query: { next: to.path },
      });
    }
  } else if (metaHas(to, 'requiresProfile') && !user.profile_setup) {
    // Redirect for Onboarding
    if (to.path === '/onboard') {
      next();
    } else {
      next({
        path: '/onboard',
        query: { next: to.path },
      });
    }
  } else {
    next();
  }
});

// Page Title Setter
router.afterEach((to) => {
  // This goes through the matched routes from last to first, finding the
  // closest route with a title.  If we have /some/deep/nested/route and
  // /some, /deep, and /nested have titles, nested's will be chosen.
  const nearestTitle = to.matched.slice().reverse().find(
    (r) => r.meta && r.meta.title,
  );

  // If a route with a title was found, set the document (page) title
  if (nearestTitle) {
    document.title = `Jade Tree | ${nearestTitle.meta.title}`;
  } else {
    document.title = 'Jade Tree';
  }
});

export default router;
