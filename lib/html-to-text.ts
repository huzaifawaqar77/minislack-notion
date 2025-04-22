"use client";

/**
 * Converts HTML content to plain text while preserving some formatting
 * @param html HTML content to convert
 * @returns Plain text representation with markdown-like formatting
 */
export function htmlToText(html: string): string {
  // Create a temporary DOM element to parse the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Process code blocks
  const codeBlocks = tempDiv.querySelectorAll('pre code');
  codeBlocks.forEach(codeBlock => {
    const codeContent = codeBlock.textContent || '';
    const codeParent = codeBlock.parentElement;
    if (codeParent) {
      const codeWrapper = document.createElement('div');
      codeWrapper.textContent = `\`\`\`\n${codeContent}\n\`\`\``;
      codeParent.parentElement?.replaceChild(codeWrapper, codeParent);
    }
  });
  
  // Process inline code
  const inlineCodes = tempDiv.querySelectorAll('code:not(pre code)');
  inlineCodes.forEach(code => {
    const codeContent = code.textContent || '';
    const codeWrapper = document.createElement('span');
    codeWrapper.textContent = `\`${codeContent}\``;
    code.parentElement?.replaceChild(codeWrapper, code);
  });
  
  // Process bold text
  const boldTexts = tempDiv.querySelectorAll('strong');
  boldTexts.forEach(bold => {
    const boldContent = bold.textContent || '';
    const boldWrapper = document.createElement('span');
    boldWrapper.textContent = `**${boldContent}**`;
    bold.parentElement?.replaceChild(boldWrapper, bold);
  });
  
  // Process italic text
  const italicTexts = tempDiv.querySelectorAll('em');
  italicTexts.forEach(italic => {
    const italicContent = italic.textContent || '';
    const italicWrapper = document.createElement('span');
    italicWrapper.textContent = `*${italicContent}*`;
    italic.parentElement?.replaceChild(italicWrapper, italic);
  });
  
  // Process links
  const links = tempDiv.querySelectorAll('a');
  links.forEach(link => {
    const linkText = link.textContent || '';
    const href = link.getAttribute('href') || '';
    const linkWrapper = document.createElement('span');
    linkWrapper.textContent = `[${linkText}](${href})`;
    link.parentElement?.replaceChild(linkWrapper, link);
  });
  
  // Get the text content, which now includes our markdown-like formatting
  let text = tempDiv.textContent || '';
  
  // Clean up extra whitespace
  text = text.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  return text;
}
