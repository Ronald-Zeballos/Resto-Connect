import { useEffect, useState, type DependencyList } from "react";

type AsyncState<T> = {
  data: T;
  loading: boolean;
  error: string | null;
  reload: () => void;
};

export function useAsyncViewModel<T>(loader: () => Promise<T>, initialData: T, deps: DependencyList = []): AsyncState<T> {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  function reload() {
    setReloadKey((current) => current + 1);
  }

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);

    loader()
      .then((result) => {
        if (alive) setData(result);
      })
      .catch((reason) => {
        if (alive) setError(reason instanceof Error ? reason.message : "No se pudo cargar la información.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [...deps, reloadKey]);

  return { data, loading, error, reload };
}
