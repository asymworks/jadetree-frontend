<template>
  <jt-narrow-layout>
    <div>
      <div v-if="loading" class="flex flex-col items-center">
        <div class="text-lg font-medium">Logging in to Jade Tree</div>
        <jt-spinner class="w-12 h-12 mt-4" />
      </div>
      <div v-else>
        <h2 class="font-medium text-2xl text-center w-full mb-3">Log In to Jade Tree</h2>
      </div>
    </div>
  </jt-narrow-layout>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { mapGetters, mapState } from 'vuex';

import { authService } from '@/api';
import { ServerMode } from '@/api/types';

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

  /** Force Error Status */
  private forceError = false;

  /** Force Loading Status */
  private forceLoading = false;

  /** User Email Address */
  private userEmail = '';

  /** User Password */
  private userPassword = '';

  /** Authorization API Error */
  get authError(): string {
    return this.$store.state.auth.status.error || '';
  }

  /** Error Status */
  get error(): boolean {
    return (this.authStatus && !!this.authStatus.error) || this.forceError;
  }

  /** Loading Status */
  get loading(): boolean {
    return !this.authStatus || this.authStatus.loading || this.forceLoading;
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
  @Watch('loggedIn')
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

  /** Automatically Log In when server mode is personal */
  @Watch('serverMode', { immediate: true })
  serverModeChanged(value: ServerMode) {
    if (value === 'personal') {
      this.forceError = false;
      this.forceLoading = true;
      authService.authUsers()
        .then((users) => {
          if (!Array.isArray(users) || !users.length) {
            this.forceLoading = false;
            this.forceError = true;
            this.$notify({
              group: 'top',
              title: 'Error',
              text: 'No users are available for login',
              type: 'error',
            });
          } else if (users.length > 1) {
            this.forceLoading = false;
            this.forceError = true;
            this.$notify({
              group: 'top',
              title: 'Error',
              text: 'More than one user was returned for login',
              type: 'error',
            });
          } else {
            setTimeout(() => {
              this.userEmail = users[0].email;
              this.userPassword = '';
              this.doLogin();
            }, 1000);
          }
        })
        .catch((error) => {
          this.forceLoading = false;
          this.forceError = true;
          this.$notify({
            group: 'top',
            title: 'Error',
            text: error,
            type: 'error',
          });
        });
    }
  }

  /** Log In the User */
  doLogin() {
    const { userEmail, userPassword } = this;
    const { dispatch } = this.$store;
    dispatch('auth/login', { email: userEmail, password: userPassword });
  }
}
</script>
