<template>
  <jt-narrow-layout>
    <div v-if="serverMode === 'personal'">
      <h2 class="font-medium text-2xl text-center w-full mb-3">Register for Jade Tree</h2>
      <p class="mb-4 text-justify text-red-600">
        Registration confirmation is disabled because the server is running in
        Personal Mode.
      </p>
    </div>
    <div v-else>
      <h2 class="font-medium text-2xl text-center w-full mb-3">Register for Jade Tree</h2>
      <p class="mb-4 text-justify">
        Please enter the email address you used to register for Jade Tree and click
        the Resend button to get a new registration confirmation email.
      </p>

      <formulate-form :errors="formErrors" @submit="doResend">
        <div class="mb-4">
          <div class="sm:flex sm:space-x-4 justify-between">
            <formulate-input
              :class="['w-full']"
              autocomplete="username"
              label="Email Address"
              labelPosition="float"
              name="email"
              type="text"
              v-model="email"
              validation="required|email"
            />
          </div>
        </div>
        <div class="mt-2 flex items-center justify-end">
          <jt-button
            color="blue"
            type="submit"
          >Resend</jt-button>
        </div>
      </formulate-form>
    </div>
  </jt-narrow-layout>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters, mapState } from 'vuex';

import { authService } from '@/api';
import { ApiError, ServerMode } from '@/api/types';

import { AsyncStatus } from '@/store/util';

import JtNarrowLayout from '../layouts/JtNarrowLayout.vue';

@Component({
  components: { JtNarrowLayout },
  computed: {
    ...mapGetters([
      'serverMode',
    ]),
    ...mapState('auth', {
      authStatus: 'status',
    }),
  },
})
export default class RegisterPage extends Vue {
  /* eslint-disable lines-between-class-members */
  private authStatus!: AsyncStatus;
  private serverMode!: ServerMode;
  /* eslint-enable lines-between-class-members */

  /* eslint-disable lines-between-class-members */
  private email = '';
  /* eslint-enable lines-between-class-members */

  /** Form Errors */
  private formErrors: { [field: string]: string[] } = {};

  /** Authorization API Error */
  get authError(): string {
    return this.$store.state.auth.status.error || '';
  }

  /** Error Status */
  get error(): boolean {
    return this.authStatus && !!this.authStatus.error;
  }

  /** Loading Status */
  get loading(): boolean {
    return !this.authStatus || !!this.authStatus.loading;
  }

  /** Automatically run if query argument provided */
  mounted() {
    const { email } = this.$route.query;
    if (typeof email === 'string') {
      this.email = email;
      this.$nextTick(() => { this.doResend(); });
    }
  }

  /** Submit the data to resend a confirmation email */
  doResend() {
    if (this.serverMode === 'personal') {
      this.$router.replace('/home').catch((err) => {
        // Ignore NavigationFailureType.redirected
        if (err.type && err.type !== 2) {
          throw err;
        }
      });
    }

    const { email } = this;

    // Register the User
    authService.resend(email)
      .then(() => {
        this.$router.replace('/register/success').catch((err) => {
          // Ignore NavigationFailureType.redirected
          if (err.type && err.type !== 2) {
            throw err;
          }
        });
      })
      .catch((error: ApiError) => {
        this.formErrors = {};
        if (error.code === 422 && error.errors && error.errors.json) {
          this.formErrors = error.errors.json;
        } else {
          this.$notify({
            group: 'top',
            title: 'Error',
            text: error.message,
            type: 'error',
          });
        }
      });
  }
}
</script>
