import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, Check, ZoomIn, ZoomOut } from 'lucide-react';
import getCroppedImg from '../utils/cropImage';

const ImageCropperModal = ({ imageSrc, onCropComplete, onClose }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropChange = (crop) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom) => {
    setZoom(zoom);
  };

  const handleCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    try {
      setIsProcessing(true);
      const croppedImageBlob = await getCroppedImg(
        imageSrc,
        croppedAreaPixels
      );
      // Convert Blob to File
      const file = new File([croppedImageBlob], "profile-photo.jpg", { type: "image/jpeg" });
      onCropComplete(file);
    } catch (e) {
      console.error(e);
      alert('Error cropping image');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#171717] w-full max-w-lg rounded-[2.5rem] border border-[#333] shadow-2xl overflow-hidden relative animate-slide-in flex flex-col h-[80vh] max-h-[600px]">
        
        {/* Header */}
        <div className="p-6 border-b border-[#333] flex items-center justify-between z-10 bg-[#171717]">
          <h3 className="text-xl font-bold text-white tracking-tight">Crop Profile Photo</h3>
          <button 
            onClick={onClose}
            className="p-2 bg-[#262626] hover:bg-[#333] rounded-full text-gray-400 hover:text-white transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cropper Area */}
        <div className="relative flex-1 bg-black overflow-hidden">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={onCropChange}
            onCropComplete={handleCropComplete}
            onZoomChange={onZoomChange}
            classes={{
              containerClassName: 'bg-black',
            }}
          />
        </div>

        {/* Controls Area */}
        <div className="p-6 bg-[#171717] border-t border-[#333] z-10 flex flex-col gap-6">
          
          <div className="flex items-center gap-4">
            <ZoomOut size={20} className="text-gray-500" />
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(e.target.value)}
              className="flex-1 h-2 bg-[#262626] rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <ZoomIn size={20} className="text-gray-500" />
          </div>

          <button 
            onClick={handleSave}
            disabled={isProcessing}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98] flex items-center justify-center gap-3"
          >
            {isProcessing ? 'Processing...' : (
              <>
                <Check size={20} /> Set Profile Photo
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ImageCropperModal;
