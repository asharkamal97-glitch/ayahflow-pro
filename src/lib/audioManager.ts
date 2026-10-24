type ProgressCallback = (currentTime: number, duration: number) => void;

export type AudioSeekResult = {
  status: 'applied' | 'queued' | 'rejected';
  target: number | null;
  reason?: string;
};

type SeekRange = { start: number; end: number };

const HAVE_METADATA = 1;
const SEEK_TIMEOUT_MS = 5000;
const METADATA_TIMEOUT_MS = 15000;
const END_EPSILON_SECONDS = 0.25;

export function formatAudioTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const total = Math.floor(seconds);
  const hrs = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  const secsStr = secs < 10 ? `0${secs}` : `${secs}`;

  if (hrs > 0) {
    const minsStr = mins < 10 ? `0${mins}` : `${mins}`;
    return `${hrs}:${minsStr}:${secsStr}`;
  }
  return `${mins}:${secsStr}`;
}

export function formatAudioDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '--:--';
  return formatAudioTime(seconds);
}

/** Owns the single recitation element and reports its real media position. */
export class AudioManager {
  private audioElement: HTMLAudioElement | null = null;
  private ambientElement: HTMLAudioElement | null = null;
  private isSeekingLocked = false;
  private seekLockTimeout: ReturnType<typeof setTimeout> | null = null;
  private pendingSeekTimeout: ReturnType<typeof setTimeout> | null = null;
  private pendingSeekTarget: number | null = null;
  private progressCallbacks = new Set<ProgressCallback>();
  private endedCallbacks = new Set<() => void>();
  private errorCallbacks = new Set<(error: MediaError | null) => void>();
  private eventHandlers: Array<{ event: string; handler: EventListener }> = [];
  private isEndingHandled = false;

  public getAudioElement(): HTMLAudioElement | null {
    if (!this.audioElement && typeof document !== 'undefined') {
      const el = document.querySelector('audio[data-quran-audio="true"]') as HTMLAudioElement | null;
      if (el) {
        this.registerAudioElement(el);
      }
    }
    return this.audioElement;
  }

  public registerAudioElement(element: HTMLAudioElement | null) {
    if (this.audioElement === element) {
      if (element) this.notifyProgress();
      return;
    }
    this.detachAudioListeners();
    this.clearSeekTimers();
    this.audioElement = element;
    this.pendingSeekTarget = null;
    this.isSeekingLocked = false;
    this.isEndingHandled = false;

    if (!element) return;

    // timeupdate is authoritative: even while the browser is completing a seek,
    // publish the position reported by the active media element. Suppressing these
    // events can freeze the visible timer if a stream delays or omits `seeked`.
    this.listen(element, 'timeupdate', () => this.notifyProgress());
    this.listen(element, 'seeking', () => {
      this.isSeekingLocked = true;
      this.notifyProgress();
      this.startSeekLockFallback();
    });
    this.listen(element, 'seeked', () => {
      this.isSeekingLocked = false;
      this.clearSeekLockTimeout();
      this.notifyProgress();
    });
    this.listen(element, 'loadedmetadata', () => {
      this.isEndingHandled = false;
      this.applyPendingSeekOrNotify();
    });
    this.listen(element, 'durationchange', () => this.applyPendingSeekOrNotify());
    this.listen(element, 'loadeddata', () => this.applyPendingSeekOrNotify());
    this.listen(element, 'canplay', () => {
      this.isEndingHandled = false;
      this.applyPendingSeekOrNotify();
    });
    this.listen(element, 'progress', () => this.applyPendingSeekOrNotify());
    this.listen(element, 'emptied', () => {
      this.clearPendingSeek();
      this.isSeekingLocked = false;
      this.clearSeekLockTimeout();
      this.isEndingHandled = false;
      this.notifyProgress();
    });
    this.listen(element, 'ended', () => {
      if (this.isEndingHandled || this.isSeekingLocked) return;
      this.isEndingHandled = true;
      this.endedCallbacks.forEach((cb) => cb());
      setTimeout(() => {
        this.isEndingHandled = false;
      }, 500);
    });
    this.listen(element, 'error', () => {
      this.clearPendingSeek();
      this.isSeekingLocked = false;
      this.clearSeekLockTimeout();
      this.isEndingHandled = false;
      this.notifyProgress();
      const mediaError = element.error;
      this.errorCallbacks.forEach((cb) => cb(mediaError));
    });

    this.notifyProgress();
  }

  private listen(element: HTMLAudioElement, event: string, callback: () => void) {
    const handler: EventListener = () => callback();
    element.addEventListener(event, handler);
    this.eventHandlers.push({ event, handler });
  }

  private detachAudioListeners() {
    if (this.audioElement) {
      this.eventHandlers.forEach(({ event, handler }) => {
        this.audioElement?.removeEventListener(event, handler);
      });
    }
    this.eventHandlers = [];
  }

  private clearSeekLockTimeout() {
    if (this.seekLockTimeout) clearTimeout(this.seekLockTimeout);
    this.seekLockTimeout = null;
  }

  private clearPendingSeek() {
    if (this.pendingSeekTimeout) clearTimeout(this.pendingSeekTimeout);
    this.pendingSeekTimeout = null;
    this.pendingSeekTarget = null;
  }

  private clearSeekTimers() {
    this.clearSeekLockTimeout();
    this.clearPendingSeek();
  }

  private startSeekLockFallback() {
    this.clearSeekLockTimeout();
    this.seekLockTimeout = setTimeout(() => {
      this.seekLockTimeout = null;
      this.isSeekingLocked = false;
      this.notifyProgress();
    }, SEEK_TIMEOUT_MS);
  }

  public registerAmbientElement(element: HTMLAudioElement | null) {
    this.ambientElement = element;
  }

  public getAmbientElement(): HTMLAudioElement | null {
    return this.ambientElement;
  }

  public isSeeking(): boolean {
    return this.isSeekingLocked;
  }

  public onProgress(callback: ProgressCallback): () => void {
    this.progressCallbacks.add(callback);
    return () => this.progressCallbacks.delete(callback);
  }

  public onEnded(callback: () => void): () => void {
    this.endedCallbacks.add(callback);
    return () => this.endedCallbacks.delete(callback);
  }

  public onError(callback: (error: MediaError | null) => void): () => void {
    this.errorCallbacks.add(callback);
    return () => this.errorCallbacks.delete(callback);
  }

  private readSeekableRanges(element: HTMLAudioElement): SeekRange[] {
    const ranges: SeekRange[] = [];
    try {
      for (let index = 0; index < element.seekable.length; index += 1) {
        const start = element.seekable.start(index);
        const end = element.seekable.end(index);
        if (Number.isFinite(start) && Number.isFinite(end) && end >= start) {
          ranges.push({ start, end });
        }
      }
    } catch {
      // TimeRanges may be temporarily unavailable while a source is changing.
    }
    return ranges;
  }

  private readDuration(element: HTMLAudioElement, ranges = this.readSeekableRanges(element)): number {
    if (Number.isFinite(element.duration) && element.duration >= 0) return element.duration;
    return ranges.length ? ranges[ranges.length - 1].end : 0;
  }

  public notifyProgress() {
    const element = this.getAudioElement();
    if (!element) return;
    const currentTime = Number.isFinite(element.currentTime) ? Math.max(0, element.currentTime) : 0;
    const duration = this.readDuration(element);
    this.progressCallbacks.forEach((callback) => callback(currentTime, duration));
  }

  /**
   * Seek the active media element. Metadata requests are held until metadata arrives;
   * targets outside the element's currently seekable ranges are rejected or clamped
   * to a valid live/end boundary. UI state is never set to a target that was not sent
   * to the media element.
   */
  public seek(targetSeconds: number): AudioSeekResult {
    const element = this.getAudioElement();
    if (!element) return { status: 'rejected', target: null, reason: 'No active audio element' };
    if (!Number.isFinite(targetSeconds)) {
      return { status: 'rejected', target: null, reason: 'Seek target must be finite' };
    }
    if (targetSeconds < 0) targetSeconds = 0;

    if (element.readyState < HAVE_METADATA) {
      this.pendingSeekTarget = targetSeconds;
      if (this.pendingSeekTimeout) clearTimeout(this.pendingSeekTimeout);
      this.pendingSeekTimeout = setTimeout(() => {
        this.pendingSeekTimeout = null;
        this.pendingSeekTarget = null;
        this.notifyProgress();
      }, METADATA_TIMEOUT_MS);
      return { status: 'queued', target: targetSeconds };
    }

    return this.applySeek(targetSeconds);
  }

  private applyPendingSeekOrNotify() {
    if (this.pendingSeekTarget !== null) {
      const target = this.pendingSeekTarget;
      const result = this.applySeek(target);
      if (result.reason === 'The media element has no seekable range') {
        this.notifyProgress();
        return;
      }
      if (result.status !== 'queued') this.clearPendingSeek();
      return;
    }
    this.notifyProgress();
  }

  private applySeek(targetSeconds: number): AudioSeekResult {
    const element = this.getAudioElement();
    if (!element) return { status: 'rejected', target: null, reason: 'No active audio element' };
    if (element.readyState < HAVE_METADATA) return { status: 'queued', target: targetSeconds };

    const finiteDuration = Number.isFinite(element.duration) && element.duration >= 0
      ? element.duration
      : null;

    const ranges = this.readSeekableRanges(element);
    const firstRange = ranges.length > 0 ? ranges[0] : null;
    const lastRange = ranges.length > 0 ? ranges[ranges.length - 1] : null;
    const mediaEnd = finiteDuration ?? (lastRange ? lastRange.end : null);

    let target = Math.max(0, targetSeconds);
    if (firstRange && target < firstRange.start && finiteDuration === null) {
      target = firstRange.start;
    }
    if (mediaEnd !== null && mediaEnd > 0) {
      target = Math.min(target, mediaEnd);
    }

    this.clearPendingSeek();
    this.isSeekingLocked = true;
    this.startSeekLockFallback();
    try {
      element.currentTime = target;
    } catch {
      this.isSeekingLocked = false;
      this.clearSeekLockTimeout();
      this.notifyProgress();
      return { status: 'rejected', target: null, reason: 'The media element rejected the seek' };
    }

    // Read the position back from the real element. A seeked event reports the
    // settled position later and corrects this if the browser clamps asynchronously.
    this.notifyProgress();
    return { status: 'applied', target: Number.isFinite(element.currentTime) ? element.currentTime : target };
  }

  public async playRecitation(url?: string): Promise<boolean> {
    const element = this.getAudioElement();
    if (!element) return false;
    this.isEndingHandled = false;

    if (url && element.src !== url && !element.src.endsWith(url)) {
      element.src = url;
      element.load();
    }

    try {
      await element.play();
      return true;
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        // Harmless browser interruption during rapid track switching or source reload
        return false;
      }
      console.warn('Recitation playback interrupted or prevented by browser:', err);
      if (err?.name === 'NotAllowedError') {
        this.errorCallbacks.forEach((cb) => cb(null));
      }
      return false;
    }
  }

  public pauseRecitation(): void {
    const element = this.getAudioElement();
    if (!element) return;
    element.pause();
  }

  public play(url?: string): Promise<boolean> {
    return this.playRecitation(url);
  }

  public pause(): void {
    this.pauseRecitation();
  }

  public setVolume(volume: number, isMuted: boolean): void {
    const element = this.getAudioElement();
    if (!element) return;
    element.volume = isMuted ? 0 : Math.max(0, Math.min(1, volume));
  }

  public setPlaybackSpeed(speed: number) {
    this.setPlaybackRate(speed);
  }

  public setPlaybackRate(rate: number): void {
    const element = this.getAudioElement();
    if (!element) return;
    element.playbackRate = rate;
  }
}

export const audioManager = new AudioManager();
