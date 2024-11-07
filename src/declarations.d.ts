declare module 'recordrtc' {
    export default class RecordRTC {
      constructor(stream: MediaStream, options?: any);
      startRecording(): void;
      stopRecording(callback: (blob: Blob) => void): void;
      getBlob(): Blob;
    }
  }
  