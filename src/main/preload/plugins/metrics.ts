/**
 * @description: 记录资源加载时间的详细性能指标，包括内存使用情况（如果支持）。
 * 该函数收集并返回一个对象，该对象包含 JavaScript 堆内存使用情况以及每个加载资源的详细性能时间。
 * 
 * @returns {object} - 一个包含 JavaScript 堆大小指标和资源加载指标数组的对象，或者在不支持内存 API 时返回的错误信息。
 * 
 * @typedef {object} MemoryMetrics - 与 JavaScript 堆内存相关的指标。
 * @property {number} jsHeapSizeLimit - 堆的最大大小（以字节为单位）。
 * @property {number} totalJSHeapSize - 分配的堆总大小（以字节为单位）。
 * @property {number} usedJSHeapSize - 当前使用的堆大小（以字节为单位）。
 * 
 * @typedef {object} ResourceMetrics - 与特定资源相关的指标。
 * @property {string} name - 资源的名称（通常是 URL）。
 * @property {string} initiatorType - 触发资源加载的类型（例如：'script'、'link'、'img'）。
 * @property {number} startTime - 资源开始获取的时间。
 * @property {number} duration - 获取资源的总时间。
 * @property {number} redirectTime - 重定向花费的时间。
 * @property {number} dnsLookupTime - DNS 查找花费的时间。
 * @property {number} connectionTime - 建立连接花费的时间。
 * @property {number} secureConnectionTime - 进行 TLS 握手花费的时间（如果适用）。
 * @property {number} requestTime - 发送请求花费的时间。
 * @property {number} responseTime - 接收响应花费的时间。
 * @property {number} totalTime - 从开始到响应结束的总时间。
 * @property {number} transferSize - 传输资源的总体大小（以字节为单位）。
 * @property {number} encodedBodySize - 压缩形式的资源主体大小（以字节为单位）。
 * @property {number} decodedBodySize - 解压后的资源主体大小（以字节为单位）。
 * 
 * @typedef {object} Metrics - 函数返回的对象。
 * @property {MemoryMetrics} memoryMetrics - 包含 JavaScript 堆大小指标的对象。
 * @property {ResourceMetrics[]} resources - 包含每个加载资源的详细指标的数组。
 * 
 * @returns {Metrics} - 收集的性能和内存指标，或者在不支持内存 API 时返回的错误信息。
 */

/**
 * 收集资源性能指标的方法。
 * 
 * @returns {ResourceMetrics[]} - 包含资源性能指标的数组。
 */
export const getResourceMetrics = () => {
  return performance.getEntriesByType('resource').map(entry => {
    const resource = entry as PerformanceResourceTiming;
    return {
      name: resource.name,
      initiatorType: resource.initiatorType,
      startTime: resource.startTime,
      duration: resource.duration,
      redirectTime: resource.redirectEnd - resource.redirectStart,
      dnsLookupTime: resource.domainLookupEnd - resource.domainLookupStart,
      connectionTime: resource.connectEnd - resource.connectStart,
      secureConnectionTime: resource.secureConnectionStart > 0 ? resource.connectEnd - resource.secureConnectionStart : 0,
      requestTime: resource.responseStart - resource.requestStart,
      responseTime: resource.responseEnd - resource.responseStart,
      totalTime: resource.responseEnd - resource.startTime,
      transferSize: resource.transferSize,
      encodedBodySize: resource.encodedBodySize,
      decodedBodySize: resource.decodedBodySize
    };
  });
};

/**
 * 收集性能和内存指标的方法。
 * 
 * @returns {Metrics | object} - 收集的性能和内存指标对象，或者在不支持内存 API 时返回的错误信息对象。
 */
export const logResourceLoadTimes = () => {
  if (performance.memory) {
    const memory = performance.memory;
    const metrics = {
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      totalJSHeapSize: memory.totalJSHeapSize,
      usedJSHeapSize: memory.usedJSHeapSize,
    };
    return metrics;
  }
  return {};
}




export const getNavigationMetrics = ()  => {
  const [navigationEntry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];

  if (!navigationEntry) {
    return { error: 'Navigation timing is not supported.' };
  }

  return {
    fetchStart: navigationEntry.fetchStart,
    domainLookupStart: navigationEntry.domainLookupStart,
    domainLookupEnd: navigationEntry.domainLookupEnd,
    connectStart: navigationEntry.connectStart,
    connectEnd: navigationEntry.connectEnd,
    requestStart: navigationEntry.requestStart,
    responseStart: navigationEntry.responseStart,
    responseEnd: navigationEntry.responseEnd,
    domInteractive: navigationEntry.domInteractive,
    domContentLoadedEventStart: navigationEntry.domContentLoadedEventStart,
    domContentLoadedEventEnd: navigationEntry.domContentLoadedEventEnd,
    loadEventStart: navigationEntry.loadEventStart,
    loadEventEnd: navigationEntry.loadEventEnd,
  };
};

/**
 * 计算页面 FPS（帧率）。
 * @returns {Promise<number>} - 返回一个 Promise，解析为 FPS 值。
 */
export const getFPS = (): Promise<number> => {
  return new Promise((resolve) => {
    let frameCount = 0;
    let startTime = performance.now();

    const calculateFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      if (currentTime >= startTime + 1000) {
        resolve(frameCount);
      } else {
        requestAnimationFrame(calculateFPS);
      }
    };

    requestAnimationFrame(calculateFPS);
  });
};