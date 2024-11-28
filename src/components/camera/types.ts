
export interface Camera {
  id: string;
  name: string;
  location: string;
  embedUrl: string;
  fallbackImageUrl?: string;
  isLoading: boolean;
  hasError: boolean;
}

export interface CameraProps {
  camera: Camera;
  isSelected?: boolean;
  onClick?: () => void;
  fullSize?: boolean;
}
