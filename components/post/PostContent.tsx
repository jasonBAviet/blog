interface PostContentProps {
  content: string;
}

export function PostContent({ content }: PostContentProps) {
  return (
    <div
      className="prose prose-base prose-neutral max-w-none dark:prose-invert sm:prose-lg
        prose-headings:font-serif prose-headings:font-semibold prose-headings:tracking-tight
        prose-h2:mt-8 prose-h2:mb-3 prose-h2:text-xl sm:prose-h2:mt-10 sm:prose-h2:mb-4 sm:prose-h2:text-2xl
        prose-h3:mt-6 prose-h3:mb-2 prose-h3:text-lg sm:prose-h3:mt-8 sm:prose-h3:mb-3 sm:prose-h3:text-xl
        prose-p:font-serif prose-p:leading-relaxed prose-p:mb-5
        prose-blockquote:border-l-2 prose-blockquote:border-neutral-300 prose-blockquote:pl-5 prose-blockquote:italic prose-blockquote:text-neutral-500
        prose-ul:font-serif prose-ol:font-serif
        prose-li:mb-1
        prose-strong:text-neutral-900 dark:prose-strong:text-white
        prose-a:text-neutral-900 prose-a:underline dark:prose-a:text-white"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
