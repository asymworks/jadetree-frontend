<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class LoginPage extends Vue {
  /** Log out any logged in users */
  mounted() {
    const { dispatch } = this.$store;
    dispatch('auth/logout').then(() => {
      this.$router.push('/login');
    });
  }
}
</script>
