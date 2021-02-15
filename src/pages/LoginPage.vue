<template>
  <jt-narrow-layout>
    <div>
      <div v-if="serverMode === 'personal'" class="flex flex-col items-center">
        <div class="text-lg font-medium">Logging in to Jade Tree</div>
        <jt-spinner v-if="autoLoginLoading" class="w-12 h-12 mt-4" />
        <div v-if="autoLoginError" class="font-medium text-red-600">
          {{ autoLoginError }}
        </div>
      </div>
      <div v-else>
        <h2 class="font-medium text-2xl text-center w-full mb-3">Log In to Jade Tree</h2>
        <div v-if="serverMode === 'family'">
          <p>Select your user from the list below to log in.</p>
          <ul class="border rounded mt-2">
            <li v-for="(user, index) in userList"
              class="flex flex-row items-center justify-start p-2 cursor-pointer hover:bg-gray-100"
              :class="{
                  'rounded-t': index === 0,
                  'border-b': index !== userList.length - 1,
                  'rounded-b': index === userList.length - 1,
                }"
              :key="user.email"
              @click="doLogin(user.email, '')"
            >
              <img class="h-8 w-8 rounded-full" :src="gravatarUrl(user.email)" alt="">
              <div class="font-medium ml-2">{{ user.name }}</div>
            </li>
          </ul>
        </div>
        <div v-else>
          <p>Enter your email address and password to log in.</p>
          <formulate-form :errors="formErrors" @submit="doLogin(userEmail, userPassword)">
            <div class="mb-4">
              <formulate-input
                :class="['w-full']"
                autocomplete="username"
                label="Email Address"
                labelPosition="float"
                name="email"
                type="text"
                v-model="userEmail"
                validation="required|email"
              />
            </div>
            <div class="mb-4">
              <formulate-input
                :class="['w-full']"
                autocomplete="current-password"
                label="Password"
                labelPosition="float"
                name="password"
                type="password"
                v-model="userPassword"
                validation="required"
              />
            </div>
            <div class="mt-2 flex items-center justify-end">
              <jt-button
                color="blue"
                type="submit"
                :loading="loading"
              >Log In</jt-button>
            </div>
          </formulate-form>
        </div>
      </div>
    </div>
  </jt-narrow-layout>
</template>

<script lang="ts">
import md5 from 'md5';
import { Component, Vue, Watch } from 'vue-property-decorator';
import { mapGetters, mapState } from 'vuex';

import { authService } from '@/api';
import { AuthUserSchema, ServerMode } from '@/api/types';

import { AsyncStatus } from '@/store/util';

import JtNarrowLayout from '../layouts/JtNarrowLayout.vue';

@Component({
  components: { JtNarrowLayout },
  computed: {
    ...mapGetters([
      'loggedIn',
      'serverMode',
    ]),
    ...mapState('auth', {
      authStatus: 'status',
    }),
  },
})
export default class LoginPage extends Vue {
  /* eslint-disable lines-between-class-members */
  private authStatus!: AsyncStatus;
  private loggedIn!: boolean;
  private serverMode!: ServerMode;
  /* eslint-enable lines-between-class-members */

  /** Auto-Login Error Message */
  private autoLoginError: string | null = null;

  /** Auto-Login Loading Status */
  private autoLoginLoading = false;

  /** Form Errors */
  private formErrors: { [field: string]: string[] } = {};

  /** User Email Address */
  private userEmail = '';

  /** User Password */
  private userPassword = '';

  /** User List (Personal and Family Mode Servers) */
  private userList: AuthUserSchema[] = [];

  /** Authorization API Error */
  get authError(): string {
    return this.$store.state.auth.status.error || '';
  }

  /** Error Status */
  get error(): boolean {
    return (this.authStatus && !!this.authStatus.error) || !!this.autoLoginError;
  }

  /** Loading Status */
  get loading(): boolean {
    return !this.authStatus || this.authStatus.loading || this.autoLoginLoading;
  }

  /** Notify on Vuex Login Errors */
  @Watch('authError')
  authErrorChanged(value: string) {
    if (value) {
      this.$notify({
        group: 'top',
        title: 'Error',
        text: value,
        type: 'error',
      });
    }
  }

  /** Notify and Redirect on Login */
  @Watch('loggedIn', { immediate: true })
  loggedInChanged(value: boolean) {
    if (value) {
      this.$notify({
        group: 'top',
        title: 'Logged In',
        text: 'Successfully logged in to Jade Tree',
        type: 'success',
      });

      let { next } = this.$router.currentRoute.query;
      if (!next) {
        next = '/home';
      }

      this.$router.push(next as string).catch((err) => {
        // Ignore NavigationFailureType.redirected
        if (err.type && err.type !== 2) {
          throw err;
        }
      });
    }
  }

  /** Automatically Log In when server mode is personal and user list loads */
  @Watch('userList', { immediate: true })
  userListChanged() {
    if (this.serverMode === 'personal') {
      this.autoLoginError = null;
      this.autoLoginLoading = true;
      if (!Array.isArray(this.userList) || !this.userList.length) {
        this.autoLoginLoading = false;
        this.autoLoginError = 'No users are available for login.';
      } else if (this.userList.length > 1) {
        this.autoLoginLoading = false;
        this.autoLoginError = 'More than one user was returned for login.';
      } else {
        setTimeout(() => { this.doLogin(this.userList[0].email, ''); }, 1000);
      }
    }
  }

  /** Load user list on component mount */
  mounted() {
    authService.getUserList().then((users) => { this.userList = users; });
  }

  /** Log In the User */
  doLogin(email: string, password: string) {
    const { dispatch } = this.$store;
    dispatch('auth/login', { email, password });
  }

  /** Get the Gravatar URL for a User */
  gravatarUrl(email: string): string {
    return `https://www.gravatar.com/avatar/${md5(email || '')}?d=identicon`;
  }
}
</script>
