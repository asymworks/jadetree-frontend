<!-- eslint-disable max-len -->
<template>
  <nav class="relative top-0 w-full bg-gray-800 z-100" v-click-away="closeMenu">
    <div class="w-full max-w-5xl mx-auto sm:flex sm:items-center sm:h-12">
      <!-- Navbar Burger and Branding -->
      <div class="flex items-center justify-between px-2 py-2 sm:py-0">
        <div class="flex items-center sm:hidden">
          <button v-if="apiLoaded" class="text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:bg-gray-700 focus:text-white active:outline-none" aria-label="Main menu" :aria-expanded="{'true':open,'false':!open}" @click="open=!open">
            <svg class="h-6 w-6" :class="{block:!open,hidden:open}" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            <svg class="h-6 w-6" :class="{block:open,hidden:!open}" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div class="flex items-center sm:flex-grow-0 text-white ml-2">
          <img class="block sm:hidden md:block h-8 w-auto" src="../assets/images/jadetree-logo-sm-dark.svg" alt="Jade Tree Logo" />
          <img class="hidden sm:block md:hidden h-8 w-auto" src="../assets/images/jadetree-mark-sm-dark.svg" alt="Jade Tree Logo" />
        </div>
      </div>

      <!-- Navigation Menu -->
      <div class="relative w-full">
        <div class="absolute inset-x-0 top-0 sm:static sm:flex-grow sm:flex flex-col items-stretch sm:flex-row sm:items-center sm:justify-between sm:px-2 bg-gray-800" :class="{flex:open,hidden:!open}">
          <!-- Left Hand Buttons -->
          <div v-if="loggedIn">
            <router-link to="/home" class="navbar-button">Dashboard</router-link>
            <router-link to="/budget" class="navbar-button">Budget</router-link>
            <router-link to="/transactions" class="navbar-button">Transactions</router-link>
            <router-link to="/reports" class="navbar-button">Reports</router-link>
          </div>
          <div v-else></div>

          <!-- Divider (Small Screens Only) -->
          <hr v-if="loggedIn" class="border-px sm:hidden" />

          <!-- Right Hand Buttons -->
          <div v-if="loggedIn">
            <div class="block sm:inline-block sm:mt-0 sm:cursor-pointer group">
              <div class="hidden sm:flex items-center px-3 rounded-md text-sm font-medium leading-5 text-gray-300">
                <div>{{ user.name }}</div>
                <img class="ml-2 h-6 w-6 rounded-full" :src="gravatarUrl" alt="">
              </div>
              <div class="sm:absolute sm:hidden sm:group-hover:block sm:right-0 sm:py-3 sm:px-2 sm:w-40 sm:bg-gray-800 sm:rounded-b-md z-200">
                <router-link to="/profile" class="navbar-button navbar-button__menu">Profile</router-link>
                <router-link to="/settings" class="navbar-button navbar-button__menu">Settings</router-link>
                <router-link v-if="serverMode !== 'personal'" to="/logout" class="navbar-button navbar-button__menu">Log Out</router-link>
              </div>
            </div>
          </div>
          <div v-else-if="needsSetup">
            <span class="navbar-button navbar-button__active cursor-default">Setup Jade Tree</span>
          </div>
          <div v-else-if="apiLoaded">
            <router-link to="/register" class="navbar-button">Register</router-link>
            <router-link to="/login" class="navbar-button">Log In</router-link>
          </div>
          <div v-else>
            <div class="navbar-button"><div class="navbar-spacer"></div></div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script lang="ts">
import md5 from 'md5';
import { directive as clickAway } from 'vue-clickaway';
import { Component, Vue, Watch } from 'vue-property-decorator';
import { mapGetters, mapState } from 'vuex';

import { UserSchema } from '@/api/types';

@Component({
  computed: {
    ...mapGetters([
      'apiLoaded',
      'loggedIn',
      'user',
    ]),
    ...mapState({
      needsSetup: 'needsSetup',
    }),
    ...mapState('api', {
      serverMode: 'serverMode',
    }),
  },
  directives: { clickAway },
})
export default class Navbar extends Vue {
  /* eslint-disable lines-between-class-members */
  private apiLoaded!: boolean;
  private loggedIn!: boolean;
  private needsSetup!: boolean;
  private serverMode!: string;
  private user!: UserSchema;
  /* eslint-enable lines-between-class-members */

  /* eslint-disable lines-between-class-members */
  private open = false;
  /* eslint-disable lines-between-class-members */

  get gravatarUrl(): string {
    const { email } = this.user;
    return `https://www.gravatar.com/avatar/${md5(email || '')}?d=identicon`;
  }

  /** Close Burger Menu on Route Update */
  @Watch('$route')
  routeChanged() {
    this.closeMenu();
  }

  /** Close Burger Menu */
  closeMenu() {
    this.open = false;
  }
}
</script>

<style>
.navbar-button {
  @apply .block .px-3 .py-2;
  @apply .font-medium .text-gray-300;
  @apply .transition .duration-150 .ease-in-out;
}

.navbar-button.navbar-button__active {
  @apply .text-white .bg-gray-900;
}

.navbar-button:hover {
  @apply .text-white .bg-gray-700;
}

.navbar-spacer {
  content: ' ';
  overflow: hidden;
  font-size: 0.875rem;
  line-height: 1.25rem;
  height: 1em;
  width: 0;
}

@media (min-width: 640px) {
  .navbar-button {
    @apply .rounded-md .text-sm .inline-block .ml-4;
  }

  .navbar-button__menu {
    @apply .rounded-none .block .m-0;
  }
}
</style>
