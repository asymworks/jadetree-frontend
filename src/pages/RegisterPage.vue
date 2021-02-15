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
        Welcome to Jade Tree! Please fill in the information below to register
        your account and click the &ldquo;Register&rdquo; button to complete
        registration.
      </p>

      <formulate-form :errors="formErrors" @submit="doRegister">
        <div class="mb-4">
          <div class="sm:flex sm:space-x-4 justify-between">
            <formulate-input
              :class="['w-full']"
              autocomplete="name"
              label="Your Name"
              labelPosition="float"
              name="name"
              type="text"
              v-model="name"
              validation="required"
            />
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
          <div
            v-if="serverMode && serverMode === 'public'"
            class="sm:flex sm:space-x-4 justify-between"
          >
            <formulate-input
              :class="['w-full']"
              autocomplete="new-password"
              label="Password"
              labelPosition="float"
              name="password"
              type="password"
              v-model="password"
              validation="required|min:8,length|matches:/[0-9]/|matches:/[a-z]/|matches:/[A-Z]/"
              :validation-messages="{
                matches: 'Passwords require at least one lower-case letter, '
                  + 'one upper case letter, and one number',
              }"
            />
            <formulate-input
              :class="['w-full']"
              autocomplete="new-password"
              label="Confirm Password"
              labelPosition="float"
              name="password_confirm"
              type="password"
              validation="required|confirm"
              validation-name="Confirmation"
            />
          </div>
          <div
            v-if="serverMode && serverMode === 'public'"
            class="sm:flex sm:space-x-4 justify-between mt-3 sm:mt-0"
          >
            <formulate-input
              labelClass="ml-1 font-medium text-xs"
              label="I accept the Terms of Service"
              name="terms"
              type="checkbox"
              validation="accepted"
            />
          </div>
        </div>
        <div class="mt-2 flex items-center justify-end">
          <jt-button
            color="blue"
            type="submit"
            :loading="authLoading"
          >Register</jt-button>
        </div>
      </formulate-form>
    </div>
  </jt-narrow-layout>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters, mapState } from 'vuex';

import { authService } from '@/api';
import {
  ApiError,
  AuthRegisterSchema,
  ServerMode,
  UserSchema,
} from '@/api/types';

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
  private name = '';
  private email = '';
  private password = '';
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

  /** Submit the data and set up the Jade Tree server */
  doRegister() {
    if (this.serverMode === 'personal') {
      this.$router.replace('/home').catch((err) => {
        // Ignore NavigationFailureType.redirected
        if (err.type && err.type !== 2) {
          throw err;
        }
      });
    }

    const { email, password, name } = this;
    const data: AuthRegisterSchema = {
      email,
      password: password || '',
      name,
    };

    // Register the User
    authService.register(data)
      .then((user: UserSchema) => {
        if (user.confirmed) {
          this.$notify({
            group: 'top',
            title: 'Success',
            text: 'User registration was successful.  Welcome to Jade Tree!',
            type: 'success',
          }, 5000);

          this.$router.replace('/home').catch((err) => {
            // Ignore NavigationFailureType.redirected
            if (err.type && err.type !== 2) {
              throw err;
            }
          });
        } else {
          this.$router.replace('/register/success').catch((err) => {
            // Ignore NavigationFailureType.redirected
            if (err.type && err.type !== 2) {
              throw err;
            }
          });
        }
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
