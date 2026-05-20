import { useDeferredValue, useMemo, useState } from "react";
import { demoProductos } from "../../../data/demo";
import { useAsyncViewModel } from "../../../core/hooks/useAsyncViewModel";
import { menuPort } from "../adapters/menuRepository";

export function useMenuViewModel() {
  const { data, loading, error } = useAsyncViewModel(() => menuPort.list(), demoProductos, []);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas");
  const deferredQuery = useDeferredValue(query);

  const categories = useMemo(() => ["Todas", ...Array.from(new Set(data.map((item) => item.categoria)))], [data]);
  const products = useMemo(() => {
    return data.filter((item) => (category === "Todas" || item.categoria === category) && item.nombre.toLowerCase().includes(deferredQuery.toLowerCase()));
  }, [category, data, deferredQuery]);

  return { data: products, loading, error, query, setQuery, category, setCategory, categories };
}
