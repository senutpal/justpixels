/**
 * Data structure for a metadata item.
 */
interface MetadataItem {
  /** Title of the metadata type */
  title: string;
  /** Description of privacy implications */
  description: string;
}

/** Metadata items for the left column */
const leftColumnItems: MetadataItem[] = [
  {
    title: "GPS Coordinates",
    description:
      "Exact latitude and longitude where the photo was taken. Accurate to within a few meters.",
  },
  {
    title: "Date and Timestamp",
    description:
      "Exact date and time, often down to the second. Reveals your schedule and habits.",
  },
  {
    title: "Device Information",
    description:
      "Camera or phone model, manufacturer, and sometimes unique serial numbers that can identify your specific device.",
  },
  {
    title: "Owner Name",
    description:
      "If you've configured your name in your camera or phone settings, it gets embedded in every photo.",
  },
];

/** Metadata items for the right column */
const rightColumnItems: MetadataItem[] = [
  {
    title: "Editing Software",
    description:
      "Every app that touches your photo can leave traces: Photoshop, Lightroom, your phone's built-in editor.",
  },
  {
    title: "Thumbnail Previews",
    description:
      'Some formats store the original thumbnail even after you crop or edit. Your "cropped out" content may still be visible.',
  },
  {
    title: "Camera Settings",
    description:
      "Aperture, shutter speed, ISO, focal length. Can reveal what kind of photography equipment you own.",
  },
  {
    title: "Copyright and Comments",
    description:
      "Custom fields that may contain your contact info, website, or personal notes you forgot were there.",
  },
];

/**
 * Metadata details content for the about page accordion.
 *
 * @description
 * Displays detailed information about image metadata, what it reveals,
 * real-world privacy risks, and notes about social media platforms.
 *
 * @returns The rendered MetadataDetails component
 */
export function MetadataDetails() {
  return (
    <div className="space-y-6 pt-2">
      {/* What is Metadata - Intro */}
      <div className="space-y-3">
        <h4 className="font-bold text-xs uppercase tracking-wide text-muted-foreground">
          What is Image Metadata ?
        </h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          When you snap a photo, your camera doesn&apos;t just capture the
          image. It also embeds <strong>metadata</strong> (also called EXIF
          data). This is invisible information stored inside the image file
          itself. You can&apos;t see it by looking at the photo, but anyone with
          basic tools can extract it in seconds.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          This data was originally designed to help photographers organize their
          work. But in the age of social sharing, it has become a serious
          privacy risk.
        </p>
      </div>

      {/* What Metadata Contains */}
      <div className="space-y-4">
        <h4 className="font-bold text-xs uppercase tracking-wide text-muted-foreground">
          What Metadata Reveals About You
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-3">
            {leftColumnItems.map((item) => (
              <MetadataItemRow key={item.title} {...item} />
            ))}
          </div>
          <div className="space-y-3">
            {rightColumnItems.map((item) => (
              <MetadataItemRow key={item.title} {...item} />
            ))}
          </div>
        </div>
      </div>

      {/* Real World Risks */}
      <div className="space-y-4">
        <h4 className="font-bold text-xs uppercase tracking-wide text-muted-foreground">
          Real World Risks
        </h4>
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>
            <strong className="text-foreground">
              Stalking and Harassment:
            </strong>{" "}
            A photo of your coffee could reveal the cafe you visit every
            morning. A picture of your pet could pinpoint your home address.
            Stalkers and harassers actively use metadata to locate targets.
          </p>
          <p>
            <strong className="text-foreground">Doxxing:</strong> When someone
            wants to expose your personal information, photos are often the
            first place they look. A single image with GPS data can unravel your
            entire location history.
          </p>
          <p>
            <strong className="text-foreground">Burglary:</strong> Photos shared
            from vacation spots advertise that you&apos;re not home. Combined
            with your home address from other photos, this creates a security
            risk.
          </p>
          <p>
            <strong className="text-foreground">Professional Risks:</strong>{" "}
            Journalists, activists, and whistleblowers can be identified and
            located through photo metadata. Even if your face isn&apos;t in the
            image, the data tells a story.
          </p>
        </div>
      </div>

      {/* Social Media Note */}
      <div className="space-y-3 border-t pt-4">
        <h4 className="font-bold text-xs uppercase tracking-wide text-muted-foreground">
          Don&apos;t Social Media Platforms Strip Metadata ?
        </h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Some platforms like Facebook and Instagram do remove EXIF data when
          you upload. However:
        </p>
        <ul className="text-sm text-muted-foreground space-y-2 pl-4">
          <li>
            • <strong>Not all platforms do this.</strong> Many forums, message
            boards, and websites preserve full metadata.
          </li>
          <li>
            • <strong>Direct sharing bypasses this.</strong> Sending photos via
            email, messaging apps, or file sharing services often preserves all
            metadata.
          </li>
          <li>
            • <strong>The platform still sees it.</strong> Even if they strip it
            for public display, they&apos;ve already collected and stored it.
          </li>
          <li>
            • <strong>Re-downloads may differ.</strong> Some platforms add their
            own metadata or compress images unpredictably.
          </li>
        </ul>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The only way to be certain is to clean your photos{" "}
          <strong>before</strong> they leave your device.
        </p>
      </div>
    </div>
  );
}

/**
 * Individual metadata item row.
 *
 * @param props - Metadata item data
 * @returns The rendered MetadataItemRow component
 */
function MetadataItemRow({ title, description }: MetadataItem) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-2 h-2 bg-primary rounded-full mt-1.5 shrink-0" />
      <div>
        <span className="font-medium">{title}</span>
        <p className="text-muted-foreground text-xs mt-0.5">{description}</p>
      </div>
    </div>
  );
}
