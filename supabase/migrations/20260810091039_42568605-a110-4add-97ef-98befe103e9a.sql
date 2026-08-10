ALTER TABLE public.agrovet_verifications
  ADD CONSTRAINT agrovet_verifications_agrovet_user_key UNIQUE (agrovet_id, user_id);

CREATE INDEX IF NOT EXISTS agrovets_name_idx ON public.agrovets (lower(name));
CREATE INDEX IF NOT EXISTS agrovets_county_idx ON public.agrovets (county);

INSERT INTO public.agrovets (name, kind, phone, hours, address, county, ward, rating, distance_km, map_x, map_y) VALUES
('Kikuyu Veterinary Clinic', 'Vet', '+254 722 431 908', 'Mon-Sat 8:00-18:00', 'Kikuyu Town, opposite Equity Bank', 'Kiambu', 'Kikuyu', 4.6, 2.1, 38, 42),
('Wangige Agrovet Centre', 'Agrovet', '+254 733 210 554', 'Mon-Sun 7:00-19:00', 'Wangige Market, Stall 14', 'Kiambu', 'Kabete', 4.3, 3.4, 52, 33),
('Limuru Poultry Health Services', 'Vet', '+254 720 884 117', 'Mon-Fri 8:30-17:00', 'Limuru Road, next to Tigoni Hospital', 'Kiambu', 'Limuru Central', 4.8, 7.9, 30, 22),
('Thika Farmers Agrovet', 'Agrovet', '+254 711 662 340', 'Mon-Sat 7:30-18:30', 'Kenyatta Highway, Thika', 'Kiambu', 'Township', 4.1, 12.5, 68, 28),
('Ruiru Livestock Supplies', 'Agrovet', '+254 726 559 013', 'Mon-Sat 8:00-18:00', 'Ruiru Bypass, Kamakis', 'Kiambu', 'Kahawa Sukari', 3.9, 9.2, 60, 47),
('Ngong Vet Surgery', 'Vet', '+254 719 445 226', 'Mon-Sat 9:00-17:30', 'Ngong Town, Bank Street', 'Kajiado', 'Ngong', 4.5, 14.8, 25, 62),
('Kitengela Agrovet & Feeds', 'Agrovet', '+254 700 318 472', 'Mon-Sun 7:00-20:00', 'Kitengela Shopping Centre', 'Kajiado', 'Kitengela', 4.2, 21.3, 72, 70),
('Nakuru Poultry Care Clinic', 'Vet', '+254 728 903 661', 'Mon-Fri 8:00-17:00', 'Kenyatta Avenue, Nakuru', 'Nakuru', 'Biashara', 4.7, 38.6, 15, 15),
('Naivasha Farm Inputs', 'Agrovet', '+254 715 227 809', 'Mon-Sat 7:30-18:00', 'Moi South Lake Road, Naivasha', 'Nakuru', 'Naivasha East', 4.0, 29.4, 20, 78),
('Eldoret Chick Supplies', 'Agrovet', '+254 737 601 285', 'Mon-Sat 8:00-18:00', 'Uganda Road, Eldoret', 'Uasin Gishu', 'Kapsoya', 4.4, 55.2, 82, 18),
('Kisumu Veterinary Centre', 'Vet', '+254 721 774 930', 'Mon-Sat 8:00-17:00', 'Oginga Odinga Street, Kisumu', 'Kisumu', 'Market Milimani', 4.3, 62.7, 88, 58),
('Meru Highlands Agrovet', 'Agrovet', '+254 702 118 546', 'Mon-Sat 7:00-19:00', 'Makutano Junction, Meru', 'Meru', 'Municipality', 4.1, 48.9, 90, 84);