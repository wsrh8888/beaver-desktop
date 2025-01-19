




export const injectJavaScript = (filePath: string) =>{
  const scriptElement = document.createElement('script');
  scriptElement.src = `file://${filePath}`;
  scriptElement.onload = () => console.log(`Script ${filePath} injected successfully`);
  scriptElement.onerror = (err) => console.error(`Failed to inject script ${filePath}:`, err);
  document.head.appendChild(scriptElement);
}

export const injectCSS = (filePath: string) =>{
  const linkElement = document.createElement('link');
  linkElement.rel = 'stylesheet';
  linkElement.href = `file://${filePath}`;
  linkElement.onload = () => console.log(`CSS ${filePath} injected successfully`);
  linkElement.onerror = (err) => console.error(`Failed to inject CSS ${filePath}:`, err);
  document.head.appendChild(linkElement);
}