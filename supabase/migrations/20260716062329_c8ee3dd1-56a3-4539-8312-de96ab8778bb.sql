
CREATE TABLE public.feed_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient text NOT NULL,
  price_kes numeric NOT NULL,
  recorded_at date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (ingredient, recorded_at)
);

GRANT SELECT ON public.feed_prices TO anon;
GRANT SELECT ON public.feed_prices TO authenticated;
GRANT ALL ON public.feed_prices TO service_role;

ALTER TABLE public.feed_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Feed prices are publicly readable"
  ON public.feed_prices FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE INDEX feed_prices_ingredient_date_idx
  ON public.feed_prices (ingredient, recorded_at DESC);

-- Seed 90 days of historical prices with a gentle random walk around a base price
INSERT INTO public.feed_prices (ingredient, price_kes, recorded_at)
SELECT
  ing.name,
  ROUND(
    (ing.base
      + ing.base * 0.08 * sin((d)::numeric / 9.0)
      + ing.base * 0.04 * ((random() - 0.5)))::numeric,
    2
  ) AS price_kes,
  (CURRENT_DATE - d) AS recorded_at
FROM
  (VALUES
    ('Maize', 55::numeric),
    ('Soya', 95::numeric),
    ('Fishmeal', 180::numeric),
    ('Calcium', 40::numeric),
    ('Premix', 320::numeric)
  ) AS ing(name, base),
  generate_series(0, 89) AS d
ON CONFLICT (ingredient, recorded_at) DO NOTHING;
