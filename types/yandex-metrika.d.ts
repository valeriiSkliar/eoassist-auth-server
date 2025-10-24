// Yandex Metrika type definitions
interface Window {
  ym: (
    counterId: number,
    method: string,
    goal?: string,
    params?: Record<string, any>
  ) => void;
}

declare function ym(
  counterId: number,
  method: string,
  goal?: string,
  params?: Record<string, any>
): void;
