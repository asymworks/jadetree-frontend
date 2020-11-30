<!-- eslint-disable max-len -->
<template>
  <notificationGroup v-bind="$attrs">
    <div class="fixed inset-0 flex px-4 pt-12 pointer-events-none p-6 items-start justify-end" style="z-index: 10000;">
      <div class="max-w-sm w-full">
        <notification v-slot="{ notifications }">
          <div
            class="flex max-w-sm w-full mx-auto bg-white shadow-md rounded-lg overflow-hidden mt-4"
            v-for="notification in notifications"
            :key="notification.id"
          >
            <div
              v-if="notification.type === 'success'"
              class="flex justify-center items-center w-12 bg-green-500"
            >
              <svg
                class="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>

            <div
              v-else-if="notification.type === 'warning'"
              class="flex justify-center items-center w-12 bg-yellow-500"
            >
              <svg
                class="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>

            <div
              v-else-if="notification.type === 'error'"
              class="flex justify-center items-center w-12 bg-red-500"
            >
              <svg
                class="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                ></path>
              </svg>
            </div>

            <div
              v-else-if="notification.type === 'info'"
              class="flex justify-center items-center w-12 bg-teal-500"
            >
              <svg
                class="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>

            <div v-else class="flex justify-center items-center w-12 bg-gray-500">
              <svg
                class="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>

            <div class="-mx-3 py-1 px-2">
              <div class="mx-3">
                <span
                  class="font-semibold text-gray-600"
                  :class="{
                      'text-green-500': notification.type === 'success',
                      'text-yellow-500': notification.type === 'warning',
                      'text-red-500': notification.type === 'error',
                      'text-teal-500': notification.type === 'info',
                    }"
                  >
                    {{ notification.title }}
                  </span>
                <p class="text-gray-600 text-sm">{{ notification.text }}</p>
              </div>
            </div>
          </div>
        </notification>
      </div>
    </div>
  </notificationGroup>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class JtNotificationGroup extends Vue {
}
</script>
