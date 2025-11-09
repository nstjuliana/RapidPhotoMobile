/**
 * Permission Service
 *
 * Handles camera and media library permissions for photo access.
 * Provides user-friendly error messages and permission request flows.
 *
 * @module src/services/permissions/PermissionService
 */

// Using expo-image-picker permissions API

/**
 * Permission status for different media access types
 */
export interface PermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
  message: string;
}

/**
 * Permission service for handling camera and media library access
 */
export class PermissionService {
  /**
   * Request camera permission
   * @returns Promise<PermissionStatus>
   */
  static async requestCameraPermission(): Promise<PermissionStatus> {
    try {
      // Import expo-image-picker dynamically to avoid circular dependencies
      const { requestCameraPermissionsAsync } = await import('expo-image-picker');

      const { status, canAskAgain } = await requestCameraPermissionsAsync();

      if (status === 'granted') {
        return {
          granted: true,
          canAskAgain: true,
          message: 'Camera permission granted'
        };
      }

      return {
        granted: false,
        canAskAgain,
        message: canAskAgain
          ? 'Camera permission is required to take photos. Please grant permission when prompted.'
          : 'Camera permission was denied. Please enable it in your device settings.'
      };
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      return {
        granted: false,
        canAskAgain: true,
        message: 'Unable to request camera permission. Please check your device settings.'
      };
    }
  }

  /**
   * Request media library permission
   * @returns Promise<PermissionStatus>
   */
  static async requestMediaLibraryPermission(): Promise<PermissionStatus> {
    try {
      // Import expo-image-picker dynamically to avoid circular dependencies
      const { requestMediaLibraryPermissionsAsync } = await import('expo-image-picker');

      const { status, canAskAgain } = await requestMediaLibraryPermissionsAsync();

      if (status === 'granted') {
        return {
          granted: true,
          canAskAgain: true,
          message: 'Media library permission granted'
        };
      }

      return {
        granted: false,
        canAskAgain,
        message: canAskAgain
          ? 'Media library permission is required to select photos. Please grant permission when prompted.'
          : 'Media library permission was denied. Please enable it in your device settings.'
      };
    } catch (error) {
      console.error('Error requesting media library permission:', error);
      return {
        granted: false,
        canAskAgain: true,
        message: 'Unable to request media library permission. Please check your device settings.'
      };
    }
  }

  /**
   * Check current permission status for camera
   * @returns Promise<PermissionStatus>
   */
  static async checkCameraPermission(): Promise<PermissionStatus> {
    try {
      // Import expo-image-picker dynamically to avoid circular dependencies
      const { getCameraPermissionsAsync } = await import('expo-image-picker');

      const { status, canAskAgain } = await getCameraPermissionsAsync();

      if (status === 'granted') {
        return {
          granted: true,
          canAskAgain: true,
          message: 'Camera permission granted'
        };
      }

      return {
        granted: false,
        canAskAgain,
        message: 'Camera permission not granted'
      };
    } catch (error) {
      console.error('Error checking camera permission:', error);
      return {
        granted: false,
        canAskAgain: true,
        message: 'Unable to check camera permission status'
      };
    }
  }

  /**
   * Check current permission status for media library
   * @returns Promise<PermissionStatus>
   */
  static async checkMediaLibraryPermission(): Promise<PermissionStatus> {
    try {
      // Import expo-image-picker dynamically to avoid circular dependencies
      const { getMediaLibraryPermissionsAsync } = await import('expo-image-picker');

      const { status, canAskAgain } = await getMediaLibraryPermissionsAsync();

      if (status === 'granted') {
        return {
          granted: true,
          canAskAgain: true,
          message: 'Media library permission granted'
        };
      }

      return {
        granted: false,
        canAskAgain,
        message: 'Media library permission not granted'
      };
    } catch (error) {
      console.error('Error checking media library permission:', error);
      return {
        granted: false,
        canAskAgain: true,
        message: 'Unable to check media library permission status'
      };
    }
  }

  /**
   * Request all required permissions for photo upload functionality
   * @returns Promise<{camera: PermissionStatus, mediaLibrary: PermissionStatus}>
   */
  static async requestAllPhotoPermissions(): Promise<{
    camera: PermissionStatus;
    mediaLibrary: PermissionStatus;
  }> {
    const [camera, mediaLibrary] = await Promise.all([
      this.requestCameraPermission(),
      this.requestMediaLibraryPermission()
    ]);

    return {
      camera,
      mediaLibrary
    };
  }

  /**
   * Check if all required permissions are granted
   * @returns Promise<boolean>
   */
  static async hasAllPhotoPermissions(): Promise<boolean> {
    const [camera, mediaLibrary] = await Promise.all([
      this.checkCameraPermission(),
      this.checkMediaLibraryPermission()
    ]);

    return camera.granted && mediaLibrary.granted;
  }
}
