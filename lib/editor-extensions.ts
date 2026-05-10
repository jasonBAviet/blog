import { Extension } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import PlaceholderExtension from "@tiptap/extension-placeholder";
import LinkExtension from "@tiptap/extension-link";

const ImageUploadExtension = Extension.create({
  name: "imageUpload",
  addOptions() {
    return {
      onUpload: (file: File): Promise<string> => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      },
    };
  },
});

export { StarterKit, ImageExtension, PlaceholderExtension, LinkExtension, ImageUploadExtension };
