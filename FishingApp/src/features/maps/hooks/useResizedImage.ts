import { useState, useEffect } from "react";
import { Image } from "react-native";
import { Asset } from "expo-asset";
import * as ImageManipulator from "expo-image-manipulator";

export function useResizedImage(imageSource: any, width: number) {
  const [resizedImage, setResizedImage] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;

    const resize = async () => {
      try {
        // Resolve the asset source
        const asset = Asset.fromModule(imageSource);
        await asset.downloadAsync();

        if (!asset.localUri) return;

        // Resize the image
        const result = await ImageManipulator.manipulateAsync(
          asset.localUri,
          [{ resize: { width } }],
          { compress: 1, format: ImageManipulator.SaveFormat.PNG }
        );

        if (isMounted) {
          setResizedImage({ uri: result.uri });
        }
      } catch (error) {
        console.error("Failed to resize image:", error);
        // Fallback to original if resize fails
        if (isMounted) {
          setResizedImage(imageSource);
        }
      }
    };

    resize();

    return () => {
      isMounted = false;
    };
  }, [imageSource, width]);

  return resizedImage;
}
