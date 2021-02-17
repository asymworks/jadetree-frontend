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
      <h2 class="font-medium text-2xl text-center w-full mb-3">Cancel Registration</h2>
      <p class="mb-4 text-justify">
        Please enter your cancellation token below and click Cancel to cancel your
        Jade Tree registration.
      </p>

      <formulate-form :errors="formErrors" @submit="doCancel">
        <div class="mb-4">
          <div class="sm:flex sm:space-x-4 justify-between">
            <formulate-input
              :class="['w-full']"
              label="Cancellation Token"
              labelPosition="before"
              name="token"
              type="textarea"
              validation="required"
              v-model="token"
            />
          </div>
        </div>
        <div class="mt-2 flex items-center justify-end">
          <jt-button
            color="blue"
            type="submit"
          >Cancel</jt-button>
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
  private token = '';
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
    const { token } = this.$route.query;
    if (typeof token === 'string') {
      this.token = token;
      this.$nextTick(() => { this.doCancel(); });
    }
  }

  /** Submit the data to resend a confirmation email */
  doCancel() {
    if (this.serverMode === 'personal') {
      this.$router.replace('/home').catch((err) => {
        // Ignore NavigationFailureType.redirected
        if (err.type && err.type !== 2) {
          throw err;
        }
      });
    }

    const { token } = this;

    // Cancel the User
    authService.cancel(token.trim())
      .then(() => {
        this.$notify({
          group: 'top',
          title: 'Registration Cancelled',
          text: 'Your registration was cancelled successfully.',
          type: 'info',
        });
        this.$router.replace('/register').catch((err) => {
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
