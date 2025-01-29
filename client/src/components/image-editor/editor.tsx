import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { MediaFile } from "@/lib/types";
import CreateCapsule from "@/components/sendCapsule";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Crop,
  FlipHorizontal,
  FlipVertical,
  ImageDown,
  Move,
  Palette,
  Redo,
  RotateCcw,
  Sun,
  Undo,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import ReactCrop, { Crop as CropType } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { useNavigate } from "react-router-dom";

interface Photo {
  id: string;
  url: string;
  alt: string;
}

interface EditSettings {
  brightness: number;
  contrast: number;
  saturation: number;
  rotate: number;
  scale: number;
  translateX: number;
  translateY: number;
  filter: string;
  flipHorizontal: boolean;
  flipVertical: boolean;
  crop: CropType | null;
}

const defaultSettings: EditSettings = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  rotate: 0,
  scale: 1,
  translateX: 0,
  translateY: 0,
  filter: "none",
  flipHorizontal: false,
  flipVertical: false,
  crop: null,
};

const filters = {
  none: "",
  grayscale: "grayscale(100%)",
  sepia: "sepia(100%)",
  vintage: "sepia(50%) contrast(95%) brightness(95%)",
  warm: "saturate(120%) hue-rotate(10deg)",
  cool: "saturate(120%) hue-rotate(-10deg)",
};

const SELECTED_FILES_KEY = "timeCapsule_selectedFiles";

const PhotoEditor = () => {
  const navigate = useNavigate();

  const [photos, setPhotos] = useState<MediaFile[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [editSettings, setEditSettings] =
    useState<EditSettings>(defaultSettings);
  const [activeTab, setActiveTab] = useState<
    "adjust" | "transform" | "filters" | "crop"
  >("adjust");
  const [history, setHistory] = useState<EditSettings[]>([defaultSettings]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isCropping, setIsCropping] = useState(false);
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const storedPhotos = sessionStorage.getItem(SELECTED_FILES_KEY);
    if (storedPhotos) {
      // Parse the stored photos and filter only image types
      const parsedPhotos: MediaFile[] = JSON.parse(storedPhotos);
      const imagePhotos = parsedPhotos.filter(
        (photo) => photo.type === "image"
      );
      setPhotos(imagePhotos);
    }
  }, []);

  const addToHistory = useCallback(
    (newSettings: EditSettings) => {
      setHistory((prev) => {
        const newHistory = prev.slice(0, historyIndex + 1);
        return [...newHistory, newSettings];
      });
      setHistoryIndex((prev) => prev + 1);
    },
    [historyIndex]
  );

  const updateSetting = (setting: keyof EditSettings, value: any) => {
    const newSettings = {
      ...editSettings,
      [setting]: value,
    };
    setEditSettings(newSettings);
    addToHistory(newSettings);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1);
      setEditSettings(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1);
      setEditSettings(history[historyIndex + 1]);
    }
  };

  const getPhotoStyle = () => {
    return {
      filter: `
        brightness(${editSettings.brightness}%) 
        contrast(${editSettings.contrast}%) 
        saturate(${editSettings.saturation}%)
        ${filters[editSettings.filter as keyof typeof filters]}
      `,
      transform: `
        rotate(${editSettings.rotate}deg)
        scale(${editSettings.scale})
        translate(${editSettings.translateX}px, ${editSettings.translateY}px)
        scaleX(${editSettings.flipHorizontal ? -1 : 1})
        scaleY(${editSettings.flipVertical ? -1 : 1})
      `,
    };
  };

  const saveImage = async () => {
    if (!imageRef) return;

    // Ensure we're working with the current photo
    const currentPhoto = photos[currentPhotoIndex];
    if (!currentPhoto) return;

    let canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size based on original image dimensions
    canvas.width = imageRef.naturalWidth;
    canvas.height = imageRef.naturalHeight;

    // Apply all transformations
    ctx.save();

    // Apply filter and color adjustments
    ctx.filter = `
      brightness(${editSettings.brightness}%) 
      contrast(${editSettings.contrast}%) 
      saturate(${editSettings.saturation}%)
      ${filters[editSettings.filter as keyof typeof filters]}
    `;

    // Center and rotate
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((editSettings.rotate * Math.PI) / 180);

    // Scale and flip
    ctx.scale(
      editSettings.scale * (editSettings.flipHorizontal ? -1 : 1),
      editSettings.scale * (editSettings.flipVertical ? -1 : 1)
    );

    // Draw the image
    ctx.drawImage(
      imageRef,
      -canvas.width / 2,
      -canvas.height / 2,
      canvas.width,
      canvas.height
    );

    ctx.restore();

    // Apply crop if exists
    if (editSettings.crop) {
      const crop = editSettings.crop;
      const croppedCanvas = document.createElement("canvas");
      const croppedCtx = croppedCanvas.getContext("2d");
      if (!croppedCtx) return;

      // Calculate crop dimensions based on original image size
      const cropWidth = Math.round((crop.width * canvas.width) / 100);
      const cropHeight = Math.round((crop.height * canvas.height) / 100);
      const cropX = Math.round((crop.x * canvas.width) / 100);
      const cropY = Math.round((crop.y * canvas.height) / 100);

      croppedCanvas.width = cropWidth;
      croppedCanvas.height = cropHeight;

      croppedCtx.drawImage(
        canvas,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight
      );

      canvas = croppedCanvas;
    }

    // Convert to blob and download
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `edited_photo_${currentPhotoIndex + 1}.jpg`;
        a.click();
        URL.revokeObjectURL(url);
      },
      "image/jpeg",
      0.95
    );
  };

  const handleCropComplete = (crop: CropType) => {
    updateSetting("crop", crop);
  };

  const confirmCrop = () => {
    if (editSettings.crop) {
      // Apply crop and reset crop mode
      setIsCropping(false);
      addToHistory(editSettings);
    }
  };

  const cancelCrop = () => {
    setIsCropping(false);
    updateSetting("crop", null);
  };

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const handleNext = () => {
    setIsDialogOpen(true);
  };
  return (
    <>
      <div className="max-w-6xl mx-auto space-y-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-3xl font-bold">
              Edit Your Photo
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={undo}
                disabled={historyIndex === 0}
              >
                <Undo className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={redo}
                disabled={historyIndex === history.length - 1}
              >
                <Redo className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Photo Preview */}
            <div className="lg:col-span-3 relative">
              <div className="aspect-video bg-black/10 rounded-lg overflow-hidden flex items-center justify-center">
                {photos[currentPhotoIndex] && (
                  <img
                    src={photos[currentPhotoIndex].url}
                    alt={photos[currentPhotoIndex].alt}
                    className="max-h-full max-w-full object-contain transition-all duration-200"
                    style={getPhotoStyle()}
                  />
                )}
              </div>

              {/* Navigation buttons */}
              <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setCurrentPhotoIndex((prev) =>
                      prev === 0 ? photos.length - 1 : prev - 1
                    )
                  }
                  className="bg-background/80 backdrop-blur-sm"
                  disabled={photos.length <= 1}
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setCurrentPhotoIndex((prev) =>
                      prev === photos.length - 1 ? 0 : prev + 1
                    )
                  }
                  className="bg-background/80 backdrop-blur-sm"
                  disabled={photos.length <= 1}
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </div>
            </div>

            {/* Editor Controls */}
            <div className="space-y-6">
              <div className="flex space-x-2 flex-wrap justify-evenly p-2">
                <Button
                  variant={activeTab === "adjust" ? "default" : "outline"}
                  onClick={() => setActiveTab("adjust")}
                  size="sm"
                  className="flex-shrink-0"
                >
                  <Sun className="w-4 h-4 mr-2" />
                  Adjust
                </Button>
                <Button
                  variant={activeTab === "transform" ? "default" : "outline"}
                  onClick={() => setActiveTab("transform")}
                  size="sm"
                  className="flex-shrink-0"
                >
                  <Move className="w-4 h-4 mr-2" />
                  Transform
                </Button>
                <Button
                  variant={activeTab === "filters" ? "default" : "outline"}
                  onClick={() => setActiveTab("filters")}
                  size="sm"
                  className="flex-shrink-0 mt-2"
                >
                  <Palette className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>

              {/* Adjust Tab */}
              {activeTab === "adjust" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Brightness</label>
                    <Slider
                      defaultValue={[100]}
                      min={0}
                      max={200}
                      step={1}
                      onValueChange={([value]) =>
                        updateSetting("brightness", value)
                      }
                      value={[editSettings.brightness]}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Contrast</label>
                    <Slider
                      defaultValue={[100]}
                      min={0}
                      max={200}
                      step={1}
                      onValueChange={([value]) =>
                        updateSetting("contrast", value)
                      }
                      value={[editSettings.contrast]}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Saturation</label>
                    <Slider
                      defaultValue={[100]}
                      min={0}
                      max={200}
                      step={1}
                      onValueChange={([value]) =>
                        updateSetting("saturation", value)
                      }
                      value={[editSettings.saturation]}
                    />
                  </div>
                </div>
              )}

              {/* Transform Tab */}
              {activeTab === "transform" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Rotate</label>
                    <Slider
                      defaultValue={[0]}
                      min={-180}
                      max={180}
                      step={1}
                      onValueChange={([value]) =>
                        updateSetting("rotate", value)
                      }
                      value={[editSettings.rotate]}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Scale</label>
                    <Slider
                      defaultValue={[1]}
                      min={0.5}
                      max={2}
                      step={0.1}
                      onValueChange={([value]) => updateSetting("scale", value)}
                      value={[editSettings.scale]}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateSetting(
                          "flipHorizontal",
                          !editSettings.flipHorizontal
                        )
                      }
                    >
                      <FlipHorizontal className="w-4 h-4 mr-2" />
                      Flip H
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateSetting(
                          "flipVertical",
                          !editSettings.flipVertical
                        )
                      }
                    >
                      <FlipVertical className="w-4 h-4 mr-2" />
                      Flip V
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsCropping(true);
                        setActiveTab("crop");
                      }}
                    >
                      <Crop className="w-4 h-4 mr-2" />
                      Crop
                    </Button>
                  </div>
                </div>
              )}

              {/* Filters Tab */}
              {activeTab === "filters" && (
                <div className="space-y-4">
                  <Select
                    onValueChange={(value) => updateSetting("filter", value)}
                    value={editSettings.filter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="grayscale">Grayscale</SelectItem>
                      <SelectItem value="sepia">Sepia</SelectItem>
                      <SelectItem value="vintage">Vintage</SelectItem>
                      <SelectItem value="warm">Warm</SelectItem>
                      <SelectItem value="cool">Cool</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Crop UI */}
              {isCropping && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
                  <div className="container flex flex-col items-center justify-center h-full">
                    <ReactCrop
                      crop={editSettings.crop || undefined}
                      onChange={(_, percentCrop) =>
                        handleCropComplete(percentCrop)
                      }
                    >
                      <img
                        ref={setImageRef}
                        src={photos[currentPhotoIndex].url}
                        alt={photos[currentPhotoIndex].alt}
                        style={getPhotoStyle()}
                      />
                    </ReactCrop>
                    <div className="flex space-x-4 mt-4">
                      <Button onClick={confirmCrop}>
                        <Check className="w-4 h-4 mr-2" />
                        Apply Crop
                      </Button>
                      <Button variant="outline" onClick={cancelCrop}>
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Save and Reset Buttons */}
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditSettings(defaultSettings)}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button size="sm" onClick={saveImage}>
                  <ImageDown className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
          </div>
        </CardContent>

        {/* Next button */}
        <div className="flex justify-end">
          <Button size="lg" className="px-8" onClick={handleNext}>
            Next
          </Button>
        </div>
      </div>
      <CreateCapsule
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </>
  );
};

export default PhotoEditor;
