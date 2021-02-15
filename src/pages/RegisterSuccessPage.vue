<template>
  <jt-narrow-layout>
    <h2 class="font-medium text-2xl text-center w-full mb-3">Thank You for Registering</h2>
      <p class="mb-4 text-justify">
        Thank you for registering for Jade Tree! Check your email for a confirmation
        message. After
        <router-link
          class="text-blue-600"
          to="/register/confirm"
        >confirming your registration</router-link>
        you can log in to Jade Tree. If you have lost your registration confirmation email,
        you may
        <router-link
          class="text-blue-600"
          to="/register/resend"
        >request a new one</router-link>.
      </p>
  </jt-narrow-layout>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import JtNarrowLayout from '../layouts/JtNarrowLayout.vue';

@Component({
  components: { JtNarrowLayout },
})
export default class RegisterSuccessPage extends Vue {
}
</script>
