export default function mergeConfig(config1, config2) {
  return { ...config1, ...config2 }; // 真实的merge 会更复杂，不是单纯的合并
}
