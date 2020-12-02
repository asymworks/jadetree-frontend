<template>
  <jt-narrow-layout>
    <div>
      <h2 class="font-medium text-2xl text-center w-full mb-3">Setup Jade Tree Server</h2>
      <p class="mb-4 text-justify">
        Welcome to Jade Tree! Please fill in the information below to set up your
        server and first user. Click the &ldquo;Complete Setup&rdquo; button to
        create the user and you will be redirected to the user setup page.
      </p>

      <formulate-form>
        <div class="mb-4">
          <formulate-input
            :clearButton="!defaults.mode"
            :disabled="!!defaults.mode"
            :help="!!defaults.mode
              ? 'This field has been set by your system administrator and cannot be changed'
              : ''"
            :options="modeOptions"
            label="Server Mode"
            labelPosition="float"
            name="mode"
            type="jtSelect"
            v-model="mode"
            validation="required"
          />
          <div class="sm:flex sm:space-x-4 justify-between">
            <formulate-input
              :class="['w-full']"
              :disabled="!!defaults.name"
              :help="!!defaults.name
                ? 'This field has been set by your system administrator and cannot be changed'
                : ''"
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
              :disabled="!!defaults.email"
              :help="!!defaults.email
                ? 'This field has been set by your system administrator and cannot be changed'
                : ''"
              autocomplete="username"
              label="Email Address"
              labelPosition="float"
              name="email"
              type="text"
              v-model="email"
              validation="required|email"
            />
          </div>
          <div v-if="mode && mode === 'public'" class="sm:flex sm:space-x-4 justify-between">
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
        </div>
        <div class="mt-2 flex items-center justify-end">
          <jt-button
            color="blue"
            type="button"
            :loading="setupLoading"
            @click="doSetup"
          >Complete Setup</jt-button>
        </div>
      </formulate-form>
    </div>
  </jt-narrow-layout>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { ServerMode, SetupSchema } from '@/api/types';
import JtNarrowLayout from '../layouts/JtNarrowLayout.vue';

type ModeOption = {
  value: string;
  label: string;
}

const ModeOptions: ModeOption[] = [
  { value: 'personal', label: 'Personal' },
  { value: 'family', label: 'Family' },
  { value: 'public', label: 'Public' },
];

@Component({ components: { JtNarrowLayout } })
export default class SetupPage extends Vue {
  /* eslint-disable lines-between-class-members */
  private email = '';
  private mode: ServerMode | '' = '';
  private name = '';
  private password = '';
  /* eslint-enable lines-between-class-members */

  /** Server Setup Defaults */
  get defaults(): SetupSchema {
    return this.$store.state.api.setupDefaults;
  }

  /** Server Mode Options */
  get modeOptions(): ModeOption[] {
    return ModeOptions;
  }

  /** Setup Call Error */
  get setupError(): string {
    return this.$store.state.api.setupStatus.error || '';
  }

  /** Setup Call Loading */
  get setupLoading(): boolean {
    return this.$store.state.api.setupStatus.loading;
  }

  /** Load Setup Defaults */
  @Watch('defaults', { immediate: true })
  defaultsChanged(data: SetupSchema) {
    Object.keys(data).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(this, key)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (this as any)[key] = (data as any)[key];
      }
    });
  }

  /** Setup Error Occurred */
  @Watch('error', { immediate: true })
  errorChanged(value: string) {
    if (value) {
      this.$notify({
        group: 'top',
        title: 'Error',
        text: value,
        type: 'error',
      }, 5000);
    }
  }

  /** Submit the data and set up the Jade Tree server */
  doSetup() {
    const {
      mode,
      email,
      password,
      name,
    } = this;

    const data: SetupSchema = {
      mode: mode === '' ? undefined : mode,
      email,
      password,
      name,
    };

    const { dispatch } = this.$store;
    dispatch('api/setupServer', data)
      .then(() => {
        this.$notify({
          group: 'top',
          title: 'Success',
          text: 'Server setup was successful.  Welcome to Jade Tree!',
          type: 'success',
        }, 5000);

        this.$router.replace('/home').catch((err) => {
          // Ignore NavigationFailureType.redirected
          if (err.type && err.type !== 2) {
            throw err;
          }
        });
      });
  }
}
</script>
