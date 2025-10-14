import { vi } from "vitest";
import { config } from "@vue/test-utils";
// src/test/setup.js
import { setActivePinia, createPinia } from "pinia";
import { beforeEach } from "vitest";

beforeEach(() => {
  setActivePinia(createPinia());
});
// Mock global objects yang mungkin dibutuhkan
global.ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Setup Vue Test Utils global config
config.global.stubs = {
  // Stub components yang tidak perlu di-render
  "router-link": true,
  "router-view": true,
};
