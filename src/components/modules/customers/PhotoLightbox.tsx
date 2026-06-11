import { ImageLightbox } from "@/components/global/ImageLightbox";
import { customerTexts } from "@/constants/texts";
import type { CustomerVisitPhoto } from "@/types";

export function PhotoLightbox({
  onClose,
  photo,
}: {
  onClose: () => void;
  photo: CustomerVisitPhoto | null;
}) {
  return (
    <ImageLightbox
      alt={customerTexts.detail.photosLabel}
      closeLabel={customerTexts.lookup.modalClose}
      imageUrl={photo?.photoUrl ?? null}
      onClose={onClose}
    />
  );
}
