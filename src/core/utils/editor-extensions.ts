import { Extension } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import PlaceholderExtension from "@tiptap/extension-placeholder";
import LinkExtension from "@tiptap/extension-link";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/src/config/firebase-client";

async function uploadImageToStorage(file: File): Promise<string> {
  try {
    const filename = `images/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const imageRef = ref(storage, filename);
    const snapshot = await uploadBytes(imageRef, file);
    const url = await getDownloadURL(snapshot.ref);
    return url;
  } catch {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }
}

const ImageDropPasteExtension = Extension.create({
  name: "imageDropPaste",

  addProseMirrorPlugins() {
    return [];
  },

  onCreate() {
    const editor = this.editor;

    editor.view.dom.addEventListener("paste", (event: Event) => {
      const clipboardEvent = event as ClipboardEvent;
      const items = clipboardEvent.clipboardData?.items;
      if (!items) return;

      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          event.preventDefault();
          const file = item.getAsFile();
          if (file) {
            uploadImageToStorage(file).then((url) => {
              editor
                .chain()
                .focus()
                .setImage({ src: url })
                .run();
            });
          }
          break;
        }
      }
    });

    editor.view.dom.addEventListener("drop", (event: Event) => {
      const dragEvent = event as DragEvent;
      const files = dragEvent.dataTransfer?.files;
      if (!files || files.length === 0) return;

      const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
      if (imageFiles.length === 0) return;

      event.preventDefault();
      const coordinates = editor.view.posAtCoords({
        left: dragEvent.clientX,
        top: dragEvent.clientY,
      });

      imageFiles.forEach((file) => {
        uploadImageToStorage(file).then((url) => {
          editor
            .chain()
            .focus()
            .setImage({ src: url })
            .run();
        });
      });
    });
  },
});

export { StarterKit, ImageExtension, PlaceholderExtension, LinkExtension, ImageDropPasteExtension };
