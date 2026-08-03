const prisma = require("../src/config/db");
const generateBarcode = require("../src/utils/generateBarcode");

const rawData = `Nordic SKU	Base Style No.	Style Name	Inventory Description	Packing Description	Category	Fabric Composition	Fabric Weight	Colour	Colour Code	Size	Quantity From Packing List	Order No(s)	Carton No(s)	Source Page(s)	Matched with Article List	Profile Name	Dashboard Name
10101-2XL-B	10101	Sandefjord	T-Shirt	T-Shirt	Service	100% Cotton	180 gms	Black	B	2XL	91	NP10002	Z10, Z14	1	Yes	Nordic Prowear	Nordic Prowear
10101-3XL-B	10101	Sandefjord	T-Shirt	T-Shirt	Service	100% Cotton	180 gms	Black	B	3XL	67	NP10002	Z11, Z13	1	Yes	Nordic Prowear	Nordic Prowear
10101-L-B	10101	Sandefjord	T-Shirt	T-Shirt	Service	100% Cotton	180 gms	Black	B	L	144	NP10002	Z12, Z5-6	1	Yes	Nordic Prowear	Nordic Prowear
10101-M-B	10101	Sandefjord	T-Shirt	T-Shirt	Service	100% Cotton	180 gms	Black	B	M	49	NP10002	Z4	1	Yes	Nordic Prowear	Nordic Prowear
10101-S-B	10101	Sandefjord	T-Shirt	T-Shirt	Service	100% Cotton	180 gms	Black	B	S	103	NP10002	Z12, Z2-3	1	Yes	Nordic Prowear	Nordic Prowear
10101-XL-B	10101	Sandefjord	T-Shirt	T-Shirt	Service	100% Cotton	180 gms	Black	B	XL	157	NP10002	Z13, Z7-9	1	Yes	Nordic Prowear	Nordic Prowear
10101-XS-B	10101	Sandefjord	T-Shirt	T-Shirt	Service	100% Cotton	180 gms	Black	B	XS	40	NP10002	Z1	1	Yes	Nordic Prowear	Nordic Prowear
10102-2XL-B	10102	Tønsberg	Polo Shirt	Polo shirt	Serivice	52 Polyster, 48% Cotton	220gsm	Black	B	2XL	112	NP10002	P14-16, P22	1	Yes	Nordic Prowear	Nordic Prowear
10102-3XL-B	10102	Tønsberg	Polo Shirt	Polo shirt	Serivice	52 Polyster, 48% Cotton	220gsm	Black	B	3XL	60	NP10002	P17-18	1	Yes	Nordic Prowear	Nordic Prowear
10102-L-B	10102	Tønsberg	Polo Shirt	Polo shirt	Serivice	52 Polyster, 48% Cotton	220gsm	Black	B	L	111	NP10002	P20, P5-7	1	Yes	Nordic Prowear	Nordic Prowear
10102-M-B	10102	Tønsberg	Polo Shirt	Polo shirt	Serivice	52 Polyster, 48% Cotton	220gsm	Black	B	M	6	NP10002	P20	1	Yes	Nordic Prowear	Nordic Prowear
10102-S-B	10102	Tønsberg	Polo Shirt	Polo shirt	Serivice	52 Polyster, 48% Cotton	220gsm	Black	B	S	76	NP10002	P19, P3-4	1	Yes	Nordic Prowear	Nordic Prowear
10102-XL-B	10102	Tønsberg	Polo Shirt	Polo shirt	Serivice	52 Polyster, 48% Cotton	220gsm	Black	B	XL	203	NP10002	P21, P8-13	1	Yes	Nordic Prowear	Nordic Prowear
10102-XS-B	10102	Tønsberg	Polo Shirt	Polo shirt	Serivice	52 Polyster, 48% Cotton	220gsm	Black	B	XS	67	NP10002	P1-2, P19	1	Yes	Nordic Prowear	Nordic Prowear
10103-35/36-W	10103	Molde	Shirt	shirts	Service	61.7%COTTON/33.6%POLYEST ER/4.7%SPANDEX	130 gsm	White	W	35/36	29	NP10004	H2	2	Yes	Nordic Prowear	Nordic Prowear
10103-37-W	10103	Molde	Shirt	shirts	Service	61.7%COTTON/33.6%POLYEST ER/4.7%SPANDEX	130 gsm	White	W	37	38	NP10004	H1	2	Yes	Nordic Prowear	Nordic Prowear
10103-37/38-W	10103	Molde	Shirt	shirts	Service	61.7%COTTON/33.6%POLYEST ER/4.7%SPANDEX	130 gsm	White	W	37/38	6	NP10004	H3	2	Yes	Nordic Prowear	Nordic Prowear
10103-39/40-W	10103	Molde	Shirt	shirts	Service	61.7%COTTON/33.6%POLYEST ER/4.7%SPANDEX	130 gsm	White	W	39/40	25	NP10004	H3	2	Yes	Nordic Prowear	Nordic Prowear
10103-41/42-W	10103	Molde	Shirt	shirts	Service	61.7%COTTON/33.6%POLYEST ER/4.7%SPANDEX	130 gsm	White	W	41/42	23	NP10004	H4	2	Yes	Nordic Prowear	Nordic Prowear
10103-43/44-W	10103	Molde	Shirt	shirts	Service	61.7%COTTON/33.6%POLYEST ER/4.7%SPANDEX	130 gsm	White	W	43/44	16	NP10004	H5	2	Yes	Nordic Prowear	Nordic Prowear
10103-45/46-W	10103	Molde	Shirt	shirts	Service	61.7%COTTON/33.6%POLYEST ER/4.7%SPANDEX	130 gsm	White	W	45/46	9	NP10004	H5	2	Yes	Nordic Prowear	Nordic Prowear
10103-47/48-W	10103	Molde	Shirt	shirts	Service	61.7%COTTON/33.6%POLYEST ER/4.7%SPANDEX	130 gsm	White	W	47/48	4	NP10004	H4	2	Yes	Nordic Prowear	Nordic Prowear
10103-49/50-W	10103	Molde	Shirt	shirts	Service	61.7%COTTON/33.6%POLYEST ER/4.7%SPANDEX	130 gsm	White	W	49/50	6	NP10004	H4	2	Yes	Nordic Prowear	Nordic Prowear
10103-51/52-W	10103	Molde	Shirt	shirts	Service	61.7%COTTON/33.6%POLYEST ER/4.7%SPANDEX	130 gsm	White	W	51/52	5	NP10004	H2	2	Yes	Nordic Prowear	Nordic Prowear
10105-2XL-N	10105	Lillehammer	Scrubs unisex NS3361	Scrub unisex	Healthcare	65%Polyster,35% cotton	210gsm	Navy	N	2XL	6	NP10002	Q3	2	Yes	Nordic Prowear	Nordic Prowear
10105-3XL-N	10105	Lillehammer	Scrubs unisex NS3361	Scrub unisex	Healthcare	65%Polyster,35% cotton	210gsm	Navy	N	3XL	4	NP10002	Q3	2	Yes	Nordic Prowear	Nordic Prowear
10105-L-N	10105	Lillehammer	Scrubs unisex NS3361	Scrub unisex	Healthcare	65%Polyster,35% cotton	210gsm	Navy	N	L	60	NP10002	Q1, Q3	2	Yes	Nordic Prowear	Nordic Prowear
10105-M-N	10105	Lillehammer	Scrubs unisex NS3361	Scrub unisex	Healthcare	65%Polyster,35% cotton	210gsm	Navy	N	M	25	NP10002	Q2	2	Yes	Nordic Prowear	Nordic Prowear
10105-S-N	10105	Lillehammer	Scrubs unisex NS3361	Scrub unisex	Healthcare	65%Polyster,35% cotton	210gsm	Navy	N	S	21	NP10002	Q3	2	Yes	Nordic Prowear	Nordic Prowear
10105-XL-N	10105	Lillehammer	Scrubs unisex NS3361	Scrub unisex	Healthcare	65%Polyster,35% cotton	210gsm	Navy	N	XL	25	NP10002	Q2	2	Yes	Nordic Prowear	Nordic Prowear
10105-XS-N	10105	Lillehammer	Scrubs unisex NS3361	Scrub unisex	Healthcare	65%Polyster,35% cotton	210gsm	Navy	N	XS	6	NP10002	Q3	2	Yes	Nordic Prowear	Nordic Prowear
10105-2XL-W	10105	Lillehammer	Scrubs unisex NS3361	Scrub unisex	Healthcare	65%Polyster,35% cotton	210gsm	White	W	2XL	3	NP10002	Y3	2	Yes	Nordic Prowear	Nordic Prowear
10105-3XL-W	10105	Lillehammer	Scrubs unisex NS3361	Scrub unisex	Healthcare	65%Polyster,35% cotton	210gsm	White	W	3XL	2	NP10002	Y3	2	Yes	Nordic Prowear	Nordic Prowear
10105-L-W	10105	Lillehammer	Scrubs unisex NS3361	Scrub unisex	Healthcare	65%Polyster,35% cotton	210gsm	White	W	L	48	NP10002	Y1	2	Yes	Nordic Prowear	Nordic Prowear
10105-M-W	10105	Lillehammer	Scrubs unisex NS3361	Scrub unisex	Healthcare	65%Polyster,35% cotton	210gsm	White	W	M	21	NP10002	Y2	2	Yes	Nordic Prowear	Nordic Prowear
10105-S-W	10105	Lillehammer	Scrubs unisex NS3361	Scrub unisex	Healthcare	65%Polyster,35% cotton	210gsm	White	W	S	16	NP10002	Y3	2	Yes	Nordic Prowear	Nordic Prowear
10105-XL-W	10105	Lillehammer	Scrubs unisex NS3361	Scrub unisex	Healthcare	65%Polyster,35% cotton	210gsm	White	W	XL	21	NP10002	Y2	2	Yes	Nordic Prowear	Nordic Prowear
10105-XS-W	10105	Lillehammer	Scrubs unisex NS3361	Scrub unisex	Healthcare	65%Polyster,35% cotton	210gsm	White	W	XS	11	NP10002	Y3	2	Yes	Nordic Prowear	Nordic Prowear
10106-2XL-G	10106	Stavanger	Scrubs unisex NS3361	Scrub unisex	Healthcare	50%Polyster, 50%Lyocel	190 gsm	Grey	G	2XL	3	NP10002	W2	2	Yes	Nordic Prowear	Nordic Prowear
10106-L-G	10106	Stavanger	Scrubs unisex NS3361	Scrub unisex	Healthcare	50%Polyster, 50%Lyocel	190 gsm	Grey	G	L	22	NP10002	W2	2	Yes	Nordic Prowear	Nordic Prowear
10106-M-G	10106	Stavanger	Scrubs unisex NS3361	Scrub unisex	Healthcare	50%Polyster, 50%Lyocel	190 gsm	Grey	G	M	10	NP10002	W1	2	Yes	Nordic Prowear	Nordic Prowear
10106-S-G	10106	Stavanger	Scrubs unisex NS3361	Scrub unisex	Healthcare	50%Polyster, 50%Lyocel	190 gsm	Grey	G	S	10	NP10002	W1	2	Yes	Nordic Prowear	Nordic Prowear
10106-XL-G	10106	Stavanger	Scrubs unisex NS3361	Scrub unisex	Healthcare	50%Polyster, 50%Lyocel	190 gsm	Grey	G	XL	11	NP10002	W2	2	Yes	Nordic Prowear	Nordic Prowear
10106-XS-G	10106	Stavanger	Scrubs unisex NS3361	Scrub unisex	Healthcare	50%Polyster, 50%Lyocel	190 gsm	Grey	G	XS	3	NP10002	W1	2	Yes	Nordic Prowear	Nordic Prowear
10106-2XL-N	10106	Stavanger	Scrubs unisex NS3361	Scrub unisex	Healthcare	50%Polyster, 50%Lyocel	190 gsm	Navy	N	2XL	5	NP10002	G2	2	Yes	Nordic Prowear	Nordic Prowear
10106-L-N	10106	Stavanger	Scrubs unisex NS3361	Scrub unisex	Healthcare	50%Polyster, 50%Lyocel	190 gsm	Navy	N	L	37	NP10002	G2	2	Yes	Nordic Prowear	Nordic Prowear
10106-M-N	10106	Stavanger	Scrubs unisex NS3361	Scrub unisex	Healthcare	50%Polyster, 50%Lyocel	190 gsm	Navy	N	M	16	NP10002	G1	2	Yes	Nordic Prowear	Nordic Prowear
10106-S-N	10106	Stavanger	Scrubs unisex NS3361	Scrub unisex	Healthcare	50%Polyster, 50%Lyocel	190 gsm	Navy	N	S	17	NP10002	G1	2	Yes	Nordic Prowear	Nordic Prowear
10106-XL-N	10106	Stavanger	Scrubs unisex NS3361	Scrub unisex	Healthcare	50%Polyster, 50%Lyocel	190 gsm	Navy	N	XL	16	NP10002	G1	2	Yes	Nordic Prowear	Nordic Prowear
10106-XS-N	10106	Stavanger	Scrubs unisex NS3361	Scrub unisex	Healthcare	50%Polyster, 50%Lyocel	190 gsm	Navy	N	XS	6	NP10002	G2	2	Yes	Nordic Prowear	Nordic Prowear
10106-2XL-W	10106	Stavanger	Scrubs unisex NS3361	Scrub unisex	Healthcare	50%Polyster, 50%Lyocel	190 gsm	White	W	2XL	11	NP10002	F2	2	Yes	Nordic Prowear	Nordic Prowear
10106-L-W	10106	Stavanger	Scrubs unisex NS3361	Scrub unisex	Healthcare	50%Polyster, 50%Lyocel	190 gsm	White	W	L	25	NP10002	F1	2	Yes	Nordic Prowear	Nordic Prowear
10106-M-W	10106	Stavanger	Scrubs unisex NS3361	Scrub unisex	Healthcare	50%Polyster, 50%Lyocel	190 gsm	White	W	M	11	NP10002	F2	2	Yes	Nordic Prowear	Nordic Prowear
10106-S-W	10106	Stavanger	Scrubs unisex NS3361	Scrub unisex	Healthcare	50%Polyster, 50%Lyocel	190 gsm	White	W	S	4	NP10002	F1	2	Yes	Nordic Prowear	Nordic Prowear
10106-XL-W	10106	Stavanger	Scrubs unisex NS3361	Scrub unisex	Healthcare	50%Polyster, 50%Lyocel	190 gsm	White	W	XL	11	NP10002	F2	2	Yes	Nordic Prowear	Nordic Prowear
10106-XS-W	10106	Stavanger	Scrubs unisex NS3361	Scrub unisex	Healthcare	50%Polyster, 50%Lyocel	190 gsm	White	W	XS	6	NP10002	F1	2	Yes	Nordic Prowear	Nordic Prowear
10107-2XL-N	10107	Hamar	Trouser Unisex NS3357	Trouser unisex	Healthcare	65%Polyster,35% cotton	210gsm	Navy	N	2XL	6	NP10002	K3	2	Yes	Nordic Prowear	Nordic Prowear
10107-3XL-N	10107	Hamar	Trouser Unisex NS3357	Trouser unisex	Healthcare	65%Polyster,35% cotton	210gsm	Navy	N	3XL	3	NP10002	K3	2	Yes	Nordic Prowear	Nordic Prowear
10107-L-N	10107	Hamar	Trouser Unisex NS3357	Trouser unisex	Healthcare	65%Polyster,35% cotton	210gsm	Navy	N	L	32	NP10002	K1	2	Yes	Nordic Prowear	Nordic Prowear
10107-M-N	10107	Hamar	Trouser Unisex NS3357	Trouser unisex	Healthcare	65%Polyster,35% cotton	210gsm	Navy	N	M	25	NP10002	K3	2	Yes	Nordic Prowear	Nordic Prowear
10107-S-N	10107	Hamar	Trouser Unisex NS3357	Trouser unisex	Healthcare	65%Polyster,35% cotton	210gsm	Navy	N	S	11	NP10002	K2	2	Yes	Nordic Prowear	Nordic Prowear
10107-XL-N	10107	Hamar	Trouser Unisex NS3357	Trouser unisex	Healthcare	65%Polyster,35% cotton	210gsm	Navy	N	XL	19	NP10002	K2	2	Yes	Nordic Prowear	Nordic Prowear
10107-2XL-W	10107	Hamar	Trouser Unisex NS3357	Trouser unisex	Healthcare	65%Polyster,35% cotton	210gsm	White	W	2XL	3	NP10002	J1	2	Yes	Nordic Prowear	Nordic Prowear
10107-3XL-W	10107	Hamar	Trouser Unisex NS3357	Trouser unisex	Healthcare	65%Polyster,35% cotton	210gsm	White	W	3XL	4	NP10002	J1	2	Yes	Nordic Prowear	Nordic Prowear
10107-L-W	10107	Hamar	Trouser Unisex NS3357	Trouser unisex	Healthcare	65%Polyster,35% cotton	210gsm	White	W	L	27	NP10002	J3	2	Yes	Nordic Prowear	Nordic Prowear
10107-M-W	10107	Hamar	Trouser Unisex NS3357	Trouser unisex	Healthcare	65%Polyster,35% cotton	210gsm	White	W	M	22	NP10002	J2	2	Yes	Nordic Prowear	Nordic Prowear
10107-S-W	10107	Hamar	Trouser Unisex NS3357	Trouser unisex	Healthcare	65%Polyster,35% cotton	210gsm	White	W	S	17	NP10002	J2	2	Yes	Nordic Prowear	Nordic Prowear
10107-XL-W	10107	Hamar	Trouser Unisex NS3357	Trouser unisex	Healthcare	65%Polyster,35% cotton	210gsm	White	W	XL	22	NP10002	J1	2	Yes	Nordic Prowear	Nordic Prowear
10107-XS-W	10107	Hamar	Trouser Unisex NS3357	Trouser unisex	Healthcare	65%Polyster,35% cotton	210gsm	White	W	XS	5	NP10002	J1	2	Yes	Nordic Prowear	Nordic Prowear
10108-2XL-G	10108	Bergen	Trouser Unisex NS3357	Trouser unisex	Healthcare	50%Polyster, 50%Lyocel	190 gsm	Grey	G	2XL	3	NP10002	N1	2	Yes	Nordic Prowear	Nordic Prowear
10108-L-G	10108	Bergen	Trouser Unisex NS3357	Trouser unisex	Healthcare	50%Polyster, 50%Lyocel	190 gsm	Grey	G	L	21	NP10002	N2	2	Yes	Nordic Prowear	Nordic Prowear
10108-M-G	10108	Bergen	Trouser Unisex NS3357	Trouser unisex	Healthcare	50%Polyster, 50%Lyocel	190 gsm	Grey	G	M	10	NP10002	N1	2	Yes	Nordic Prowear	Nordic Prowear
10108-S-G	10108	Bergen	Trouser Unisex NS3357	Trouser unisex	Healthcare	50%Polyster, 50%Lyocel	190 gsm	Grey	G	S	10	NP10002	N1	2	Yes	Nordic Prowear	Nordic Prowear
10108-XL-G	10108	Bergen	Trouser Unisex NS3357	Trouser unisex	Healthcare	50%Polyster, 50%Lyocel	190 gsm	Grey	G	XL	11	NP10002	N2	2	Yes	Nordic Prowear	Nordic Prowear
10108-XS-G	10108	Bergen	Trouser Unisex NS3357	Trouser unisex	Healthcare	50%Polyster, 50%Lyocel	190 gsm	Grey	G	XS	3	NP10002	N1	2	Yes	Nordic Prowear	Nordic Prowear
10108-2XL-N	10108	Bergen	Trouser Unisex NS3357	Trouser unisex	Healthcare	50%Polyster, 50%Lyocel	190 gsm	Navy	N	2XL	3	NP10002	M1	2	Yes	Nordic Prowear	Nordic Prowear
10108-L-N	10108	Bergen	Trouser Unisex NS3357	Trouser unisex	Healthcare	50%Polyster, 50%Lyocel	190 gsm	Navy	N	L	27	NP10002	M1	2	Yes	Nordic Prowear	Nordic Prowear
10108-M-N	10108	Bergen	Trouser Unisex NS3357	Trouser unisex	Healthcare	50%Polyster, 50%Lyocel	190 gsm	Navy	N	M	27	NP10002	M2	2	Yes	Nordic Prowear	Nordic Prowear
10108-S-N	10108	Bergen	Trouser Unisex NS3357	Trouser unisex	Healthcare	50%Polyster, 50%Lyocel	190 gsm	Navy	N	S	16	NP10002	M2	2	Yes	Nordic Prowear	Nordic Prowear
10108-XL-N	10108	Bergen	Trouser Unisex NS3357	Trouser unisex	Healthcare	50%Polyster, 50%Lyocel	190 gsm	Navy	N	XL	5	NP10002	M1	2	Yes	Nordic Prowear	Nordic Prowear
10108-XS-N	10108	Bergen	Trouser Unisex NS3357	Trouser unisex	Healthcare	50%Polyster, 50%Lyocel	190 gsm	Navy	N	XS	11	NP10002	M1	2	Yes	Nordic Prowear	Nordic Prowear
10108-2XL-W	10108	Bergen	Trouser Unisex NS3357	Trouser unisex	Healthcare	50%Polyster, 50%Lyocel	190 gsm	White	W	2XL	8	NP10002	L2	2	Yes	Nordic Prowear	Nordic Prowear
10108-L-W	10108	Bergen	Trouser Unisex NS3357	Trouser unisex	Healthcare	50%Polyster, 50%Lyocel	190 gsm	White	W	L	20	NP10002	L1	2	Yes	Nordic Prowear	Nordic Prowear
10108-M-W	10108	Bergen	Trouser Unisex NS3357	Trouser unisex	Healthcare	50%Polyster, 50%Lyocel	190 gsm	White	W	M	11	NP10002	L2	2	Yes	Nordic Prowear	Nordic Prowear
10108-S-W	10108	Bergen	Trouser Unisex NS3357	Trouser unisex	Healthcare	50%Polyster, 50%Lyocel	190 gsm	White	W	S	11	NP10002	L2	2	Yes	Nordic Prowear	Nordic Prowear
10108-XL-W	10108	Bergen	Trouser Unisex NS3357	Trouser unisex	Healthcare	50%Polyster, 50%Lyocel	190 gsm	White	W	XL	10	NP10002	L2	2	Yes	Nordic Prowear	Nordic Prowear
10108-XS-W	10108	Bergen	Trouser Unisex NS3357	Trouser unisex	Healthcare	50%Polyster, 50%Lyocel	190 gsm	White	W	XS	3	NP10002	L1	2	Yes	Nordic Prowear	Nordic Prowear
10109-L-W	10109	Ålesund	Coat Unisex	Coat	Healthcare	65% polyester/ 35% cotton	210gsm	White	W	L	5	NP10002	AA2	2	Yes	Nordic Prowear	Nordic Prowear
10109-M-W	10109	Ålesund	Coat Unisex	Coat	Healthcare	65% polyester/ 35% cotton	210gsm	White	W	M	5	NP10002	AA2	2	Yes	Nordic Prowear	Nordic Prowear
10109-S-W	10109	Ålesund	Coat Unisex	Coat	Healthcare	65% polyester/ 35% cotton	210gsm	White	W	S	5	NP10002	AA1	2	Yes	Nordic Prowear	Nordic Prowear
10109-XL-W	10109	Ålesund	Coat Unisex	Coat	Healthcare	65% polyester/ 35% cotton	210gsm	White	W	XL	4	NP10002	AA1	2	Yes	Nordic Prowear	Nordic Prowear
10109-XS-W	10109	Ålesund	Coat Unisex	Coat	Healthcare	65% polyester/ 35% cotton	210gsm	White	W	XS	5	NP10002	AA1	2	Yes	Nordic Prowear	Nordic Prowear
10113-1-W	10113	Århus	Chef Hat	Chef hat	chef	100%cotton,  230 gsm	230gms	White	W	1	21	NP10002	AB1	2	Yes	Nordic Prowear	Nordic Prowear
10114-1-W	10114	Malmö	Chef Hat	Chef hat	chef	100%cotton,  230 gsm	230gms	White	W	1	21	NP10002	AC1	3	Yes	Nordic Prowear	Nordic Prowear
10115-1-B	10115	København	Apron	Apron	Chef	65%Polyster,35% cotton	220gsm	Black	B	1	1721	10117, NP10002, NP10003, NP10004	A1-8, AJ1-4, AJ5, B1-3, B4, D1-18, D19	2, 4	Yes	Nordic Prowear	Nordic Prowear
10115-1-LG	10115	København	Apron	Apron	Chef	65%Polyster,35% cotton	220gsm	Light Grey	LG	1	250	NP10002, NP10004	C1, E1-3, E4	2	Yes	Nordic Prowear	Nordic Prowear
10116-2XL-W	10116	Hamar	Trouser Unisex NS3357	Trouser unisex	Healthcare	65%Polyster,35% cotton	210gsm	White	W	2XL	5	NP10002	R3	2	Yes	Nordic Prowear	Nordic Prowear
10116-3XL-W	10116	Hamar	Trouser Unisex NS3357	Trouser unisex	Healthcare	65%Polyster,35% cotton	210gsm	White	W	3XL	5	NP10002	R3	2	Yes	Nordic Prowear	Nordic Prowear
10116-L-W	10116	Hamar	Trouser Unisex NS3357	Trouser unisex	Healthcare	65%Polyster,35% cotton	210gsm	White	W	L	22	NP10002	R1	2	Yes	Nordic Prowear	Nordic Prowear
10116-M-W	10116	Hamar	Trouser Unisex NS3357	Trouser unisex	Healthcare	65%Polyster,35% cotton	210gsm	White	W	M	22	NP10002	R2	2	Yes	Nordic Prowear	Nordic Prowear
10116-S-W	10116	Hamar	Trouser Unisex NS3357	Trouser unisex	Healthcare	65%Polyster,35% cotton	210gsm	White	W	S	14	NP10002	R2	2	Yes	Nordic Prowear	Nordic Prowear
10116-XL-W	10116	Hamar	Trouser Unisex NS3357	Trouser unisex	Healthcare	65%Polyster,35% cotton	210gsm	White	W	XL	24	NP10002	R3	2	Yes	Nordic Prowear	Nordic Prowear
10116-XS-W	10116	Hamar	Trouser Unisex NS3357	Trouser unisex	Healthcare	65%Polyster,35% cotton	210gsm	White	W	XS	8	NP10002	R1	2	Yes	Nordic Prowear	Nordic Prowear
10125-2XL-B	10125			T-Shirt				Black	B	2XL	50	NP10002	AY6	1	No - not in article list	Nordic Prowear	Nordic Prowear
10125-L-B	10125			T-Shirt				Black	B	L	130	NP10002	AY2-3, AY8	1	No - not in article list	Nordic Prowear	Nordic Prowear
10125-M-B	10125			T-Shirt				Black	B	M	90	NP10002	AY1, AY7	1	No - not in article list	Nordic Prowear	Nordic Prowear
10125-XL-B	10125			T-Shirt				Black	B	XL	130	NP10002	AY4-5, AY9	1	No - not in article list	Nordic Prowear	Nordic Prowear
10126-2XL-B	10126			Polo shirt				Black	B	2XL	50	NP10002	AZ12, AZ14	1, 2	No - not in article list	Nordic Prowear	Nordic Prowear
10126-L-B	10126			Polo shirt				Black	B	L	130	NP10002	AZ13, AZ4-7	1	No - not in article list	Nordic Prowear	Nordic Prowear
10126-M-B	10126			Polo shirt				Black	B	M	90	NP10002	AZ1-3	1	No - not in article list	Nordic Prowear	Nordic Prowear
10126-XL-B	10126			Polo shirt				Black	B	XL	130	NP10002	AZ13, AZ8-11	1	No - not in article list	Nordic Prowear	Nordic Prowear
20110-2XL-B	20110	Stockholm	Chef Jacket Full Sleeves	Jackets	Chef	65% polyester/ 35% cotton	210gsm	Black	B	2XL	66	NP10003	AE19-20, AE23	3	Yes	Nordic Prowear	Nordic Prowear
20110-3XL-B	20110	Stockholm	Chef Jacket Full Sleeves	Jackets	Chef	65% polyester/ 35% cotton	210gsm	Black	B	3XL	23	NP10003	AE21	3	Yes	Nordic Prowear	Nordic Prowear
20110-4XL-B	20110	Stockholm	Chef Jacket Full Sleeves	Jackets	Chef	65% polyester/ 35% cotton	210gsm	Black	B	4XL	23	NP10003	AE22	3	Yes	Nordic Prowear	Nordic Prowear
20110-5XL-B	20110	Stockholm	Chef Jacket Full Sleeves	Jackets	Chef	65% polyester/ 35% cotton	210gsm	Black	B	5XL	18	NP10003	AE25	3	Yes	Nordic Prowear	Nordic Prowear
20110-L-B	20110	Stockholm	Chef Jacket Full Sleeves	Jackets	Chef	65% polyester/ 35% cotton	210gsm	Black	B	L	186	NP10003	AE10-15, AE25	3	Yes	Nordic Prowear	Nordic Prowear
20110-M-B	20110	Stockholm	Chef Jacket Full Sleeves	Jackets	Chef	65% polyester/ 35% cotton	210gsm	Black	B	M	212	NP10003	AE24, AE3-9	3	Yes	Nordic Prowear	Nordic Prowear
20110-S-B	20110	Stockholm	Chef Jacket Full Sleeves	Jackets	Chef	65% polyester/ 35% cotton	210gsm	Black	B	S	79	NP10003	AE1-2, AE23	3	Yes	Nordic Prowear	Nordic Prowear
20110-XL-B	20110	Stockholm	Chef Jacket Full Sleeves	Jackets	Chef	65% polyester/ 35% cotton	210gsm	Black	B	XL	117	NP10003	AE16-18, AE24	3	Yes	Nordic Prowear	Nordic Prowear
20110-2XL-W	20110	Stockholm	Chef Jacket Full Sleeves	Jackets	Chef	65% polyester/ 35% cotton	210gsm	White	W	2XL	64	NP10003	AD18-19, AD23	3	Yes	Nordic Prowear	Nordic Prowear
20110-3XL-W	20110	Stockholm	Chef Jacket Full Sleeves	Jackets	Chef	65% polyester/ 35% cotton	210gsm	White	W	3XL	23	NP10003	AD20	3	Yes	Nordic Prowear	Nordic Prowear
20110-4XL-W	20110	Stockholm	Chef Jacket Full Sleeves	Jackets	Chef	65% polyester/ 35% cotton	210gsm	White	W	4XL	22	NP10003	AD21	3	Yes	Nordic Prowear	Nordic Prowear
20110-5XL-W	20110	Stockholm	Chef Jacket Full Sleeves	Jackets	Chef	65% polyester/ 35% cotton	210gsm	White	W	5XL	18	NP10003	AD23	3	Yes	Nordic Prowear	Nordic Prowear
20110-L-W	20110	Stockholm	Chef Jacket Full Sleeves	Jackets	Chef	65% polyester/ 35% cotton	210gsm	White	W	L	184	NP10003	AD22, AD9-14	3	Yes	Nordic Prowear	Nordic Prowear
20110-M-W	20110	Stockholm	Chef Jacket Full Sleeves	Jackets	Chef	65% polyester/ 35% cotton	210gsm	White	W	M	204	NP10003	AD24, AD3-8	3	Yes	Nordic Prowear	Nordic Prowear
20110-S-W	20110	Stockholm	Chef Jacket Full Sleeves	Jackets	Chef	65% polyester/ 35% cotton	210gsm	White	W	S	73	NP10003	AD1-2, AD22	3	Yes	Nordic Prowear	Nordic Prowear
20110-XL-W	20110	Stockholm	Chef Jacket Full Sleeves	Jackets	Chef	65% polyester/ 35% cotton	210gsm	White	W	XL	113	NP10003	AD15-17, AD25	3	Yes	Nordic Prowear	Nordic Prowear
20111-2XL-B	20111	Borås	Chef Jacket Full Sleeves	Jackets	Chef	65% polyester/ 35% cotton	210gsm	Black	B	2XL	23	NP10003	AG7	3	Yes	Nordic Prowear	Nordic Prowear
20111-3XL-B	20111	Borås	Chef Jacket Full Sleeves	Jackets	Chef	65% polyester/ 35% cotton	210gsm	Black	B	3XL	7	NP10003	AG8	3	Yes	Nordic Prowear	Nordic Prowear
20111-4XL-B	20111	Borås	Chef Jacket Full Sleeves	Jackets	Chef	65% polyester/ 35% cotton	210gsm	Black	B	4XL	7	NP10003	AG9	3	Yes	Nordic Prowear	Nordic Prowear
20111-L-B	20111	Borås	Chef Jacket Full Sleeves	Jackets	Chef	65% polyester/ 35% cotton	210gsm	Black	B	L	63	NP10003	AG3-4, AG7	3	Yes	Nordic Prowear	Nordic Prowear
20111-M-B	20111	Borås	Chef Jacket Full Sleeves	Jackets	Chef	65% polyester/ 35% cotton	210gsm	Black	B	M	65	NP10003	AG1-2, AG9	3	Yes	Nordic Prowear	Nordic Prowear
20111-S-B	20111	Borås	Chef Jacket Full Sleeves	Jackets	Chef	65% polyester/ 35% cotton	210gsm	Black	B	S	28	NP10003	AG6	3	Yes	Nordic Prowear	Nordic Prowear
20111-XL-B	20111	Borås	Chef Jacket Full Sleeves	Jackets	Chef	65% polyester/ 35% cotton	210gsm	Black	B	XL	40	NP10003	AG5, AG8	3	Yes	Nordic Prowear	Nordic Prowear
20111-2XL-W	20111	Borås	Chef Jacket Full Sleeves	Jackets	Chef	65% polyester/ 35% cotton	210gsm	White	W	2XL	21	NP10003	AF8	3	Yes	Nordic Prowear	Nordic Prowear
20111-3XL-W	20111	Borås	Chef Jacket Full Sleeves	Jackets	Chef	65% polyester/ 35% cotton	210gsm	White	W	3XL	8	NP10003	AF10	3	Yes	Nordic Prowear	Nordic Prowear
20111-4XL-W	20111	Borås	Chef Jacket Full Sleeves	Jackets	Chef	65% polyester/ 35% cotton	210gsm	White	W	4XL	8	NP10003	AF10	3	Yes	Nordic Prowear	Nordic Prowear
20111-L-W	20111	Borås	Chef Jacket Full Sleeves	Jackets	Chef	65% polyester/ 35% cotton	210gsm	White	W	L	62	NP10003	AF5-6, AF9	3	Yes	Nordic Prowear	Nordic Prowear
20111-M-W	20111	Borås	Chef Jacket Full Sleeves	Jackets	Chef	65% polyester/ 35% cotton	210gsm	White	W	M	75	NP10003	AF2-4	3	Yes	Nordic Prowear	Nordic Prowear
20111-S-W	20111	Borås	Chef Jacket Full Sleeves	Jackets	Chef	65% polyester/ 35% cotton	210gsm	White	W	S	27	NP10003	AF1	3	Yes	Nordic Prowear	Nordic Prowear
20111-XL-W	20111	Borås	Chef Jacket Full Sleeves	Jackets	Chef	65% polyester/ 35% cotton	210gsm	White	W	XL	39	NP10003	AF7, AF9	3	Yes	Nordic Prowear	Nordic Prowear
200120-48-B	200120	Odense	Men´s chef´s trouser	Trousers	Chef	65% polyester/ 35% cotton	210gsm	Black	B	48	20	NP10003	AJ1	3	Yes	Nordic Prowear	Nordic Prowear
200120-52-B	200120	Odense	Men´s chef´s trouser	Trousers	Chef	65% polyester/ 35% cotton	210gsm	Black	B	52	21	NP10003	AJ2	3	Yes	Nordic Prowear	Nordic Prowear
200120-62-B	200120	Odense	Men´s chef´s trouser	Trousers	Chef	65% polyester/ 35% cotton	210gsm	Black	B	62	11	NP10003	AJ3	3	Yes	Nordic Prowear	Nordic Prowear
200120-48-W	200120	Odense	Men´s chef´s trouser	Trousers	Chef	65% polyester/ 35% cotton	210gsm	White	W	48	20	NP10003	AH1	3	Yes	Nordic Prowear	Nordic Prowear
200120-52-W	200120	Odense	Men´s chef´s trouser	Trousers	Chef	65% polyester/ 35% cotton	210gsm	White	W	52	18	NP10003	AH2	3	Yes	Nordic Prowear	Nordic Prowear
200120-62-W	200120	Odense	Men´s chef´s trouser	Trousers	Chef	65% polyester/ 35% cotton	210gsm	White	W	62	11	NP10003	AH2	3	Yes	Nordic Prowear	Nordic Prowear
200121-48-BWP	200121	Vejle	Men´s chef´s trouser	Trousers	Chef	100% cotton pepita, black/white	220g/m²	Black and white Papi	BWP	48	20	NP10003	AK1	3	Yes	Nordic Prowear	Nordic Prowear
200121-52-BWP	200121	Vejle	Men´s chef´s trouser	Trousers	Chef	100% cotton pepita, black/white	220g/m²	Black and white Papi	BWP	52	21	NP10003	AK2	3	Yes	Nordic Prowear	Nordic Prowear
200121-62-BWP	200121	Vejle	Men´s chef´s trouser	Trousers	Chef	100% cotton pepita, black/white	220g/m²	Black and white Papi	BWP	62	11	NP10003	AK3	4	Yes	Nordic Prowear	Nordic Prowear
200122-48-BWS	200122	Skagen	Men´s chef´s trouser	Trousers	Chef	100% cotton stripe, black/white	200g/m²	Black and white Stri	BWS	48	20	NP10003	AL1	4	Yes	Nordic Prowear	Nordic Prowear
200122-52-BWS	200122	Skagen	Men´s chef´s trouser	Trousers	Chef	100% cotton stripe, black/white	200g/m²	Black and white Stri	BWS	52	19	NP10003	AL2	4	Yes	Nordic Prowear	Nordic Prowear
200122-62-BWS	200122	Skagen	Men´s chef´s trouser	Trousers	Chef	100% cotton stripe, black/white	200g/m²	Black and white Stri	BWS	62	11	NP10003	AL3	4	Yes	Nordic Prowear	Nordic Prowear
200123-44-B	200123	Åre	Lady´s chef´s trouser	Trousers	Chef	65% polyester/ 35% cotton	210gsm	Black	B	44	9	NP10003	AN2	4	Yes	Nordic Prowear	Nordic Prowear
200123-46-B	200123	Åre	Lady´s chef´s trouser	Trousers	Chef	65% polyester/ 35% cotton	210gsm	Black	B	46	11	NP10003	AN2	4	Yes	Nordic Prowear	Nordic Prowear
200123-48-B	200123	Åre	Lady´s chef´s trouser	Trousers	Chef	65% polyester/ 35% cotton	210gsm	Black	B	48	28	NP10003	AN1	4	Yes	Nordic Prowear	Nordic Prowear
200123-44-W	200123	Åre	Lady´s chef´s trouser	Trousers	Chef	65% polyester/ 35% cotton	210gsm	White	W	44	10	NP10003	AM2	4	Yes	Nordic Prowear	Nordic Prowear
200123-46-W	200123	Åre	Lady´s chef´s trouser	Trousers	Chef	65% polyester/ 35% cotton	210gsm	White	W	46	11	NP10003	AM2	4	Yes	Nordic Prowear	Nordic Prowear
200123-48-W	200123	Åre	Lady´s chef´s trouser	Trousers	Chef	65% polyester/ 35% cotton	210gsm	White	W	48	32	NP10003	AM1	4	Yes	Nordic Prowear	Nordic Prowear
200124-44-BWP	200124	Umeå	Lady´s chef´s trouser	Trousers	Chef	100% cotton pepita, black/white	220g/m²	Black and white Papi	BWP	44	10	NP10003	AP2	4	Yes	Nordic Prowear	Nordic Prowear
200124-46-BWP	200124	Umeå	Lady´s chef´s trouser	Trousers	Chef	100% cotton pepita, black/white	220g/m²	Black and white Papi	BWP	46	11	NP10003	AP2	4	Yes	Nordic Prowear	Nordic Prowear
200124-48-BWP	200124	Umeå	Lady´s chef´s trouser	Trousers	Chef	100% cotton pepita, black/white	220g/m²	Black and white Papi	BWP	48	31	NP10003	AP1	4	Yes	Nordic Prowear	Nordic Prowear
200125-44-BWS	200125	Piteå	Lady´s chef´s trouser	Trousers	Chef	100% cotton stripe, black/white	200g/m²	Black and white Stri	BWS	44	8	NP10003	AQ2	4	Yes	Nordic Prowear	Nordic Prowear
200125-46-BWS	200125	Piteå	Lady´s chef´s trouser	Trousers	Chef	100% cotton stripe, black/white	200g/m²	Black and white Stri	BWS	46	8	NP10003	AQ2	4	Yes	Nordic Prowear	Nordic Prowear
200125-48-BWS	200125	Piteå	Lady´s chef´s trouser	Trousers	Chef	100% cotton stripe, black/white	200g/m²	Black and white Stri	BWS	48	17	NP10003	AQ1	4	Yes	Nordic Prowear	Nordic Prowear
200126-42-B	200126	Luleå	Men´s chef´s trouser	Trousers	Chef	65% polyester/ 35% cotton	210g/m²	Black	B	42	23	NP10003	AR1	4	Yes	Nordic Prowear	Nordic Prowear
200126-58-B	200126	Luleå	Men´s chef´s trouser	Trousers	Chef	65% polyester/ 35% cotton	210g/m²	Black	B	58	27	NP10003	AR2	4	Yes	Nordic Prowear	Nordic Prowear
200127-5XL-B	200127	Risør	Men´s chef´s trouser	Trousers	Chef	65% polyester/ 35% cotton	210g/m²	Black	B	5XL	11	NP10003	AS2	4	Yes	Nordic Prowear	Nordic Prowear
200128-80X45-B	200128	Kolding	apron 80 x 45 cm with fabric ties	Apron	Chef	65% polyester/ 35% cotton	210g/m²	Black	B	80X45	209	NP10003	AU1-2, AU3	4	Yes	Nordic Prowear	Nordic Prowear`;

async function importData() {
  const lines = rawData.trim().split("\n");
  const rows = lines.slice(1);

  console.log(`Aggregating and importing ${rows.length} rows...`);

  const user = await prisma.user.findFirst();
  if (!user) {
    console.error("No user found in DB. Please seed a user first!");
    return;
  }

  // 1. Group rows by SKU to avoid duplicate SKU race conditions and sum up quantities
  const groupedProducts = {};

  rows.forEach((rowStr) => {
    const cols = rowStr.split("\t").map((c) => c.trim());
    if (cols.length < 10) return;

    const sku = cols[0];
    const quantity = parseInt(cols[11], 10) || 0;

    if (!groupedProducts[sku]) {
      groupedProducts[sku] = {
        sku,
        baseStyleNumber: cols[1] || null,
        styleName: cols[2] || null,
        inventoryDesc: cols[3] || "",
        packingDesc: cols[4] || "",
        categoryName: cols[5] || "General",
        fabricComposition: cols[6] || null,
        fabricWeight: cols[7] || null,
        color: cols[8] || "N/A",
        colorCode: cols[9] || null,
        size: cols[10] || "OS",
        totalQuantity: quantity,
        orderNos: cols[12] ? [cols[12]] : [],
        cartonNos: cols[13] ? [cols[13]] : [],
        brand: cols[16] || "Nordic Prowear",
      };
    } else {
      groupedProducts[sku].totalQuantity += quantity;
      if (cols[12] && !groupedProducts[sku].orderNos.includes(cols[12])) {
        groupedProducts[sku].orderNos.push(cols[12]);
      }
      if (cols[13] && !groupedProducts[sku].cartonNos.includes(cols[13])) {
        groupedProducts[sku].cartonNos.push(cols[13]);
      }
    }
  });

  const uniqueSkus = Object.keys(groupedProducts);
  console.log(`Found ${uniqueSkus.length} unique SKUs.`);

  // 2. Pre-create Categories
  const categoryNames = [...new Set(uniqueSkus.map((sku) => groupedProducts[sku].categoryName))];
  const categoryMap = {};

  for (const name of categoryNames) {
    let cat = await prisma.category.findUnique({ where: { name } });
    if (!cat) {
      cat = await prisma.category.create({
        data: { name, description: `${name} Apparel Category` },
      });
    }
    categoryMap[name] = cat.id;
  }

  let importedCount = 0;
  let idx = 0;

  // Process sequentially to be 100% safe with Neon DB connections
  for (const sku of uniqueSkus) {
    idx++;
    const item = groupedProducts[sku];
    const categoryId = categoryMap[item.categoryName];
    const productName = `${item.styleName ? item.styleName + " - " : ""}${item.inventoryDesc} (${item.color}, ${item.size})`;
    const fullDescription = [
      item.inventoryDesc,
      item.packingDesc ? `Packing: ${item.packingDesc}` : null,
      item.orderNos.length ? `Orders: ${item.orderNos.join(", ")}` : null,
      item.cartonNos.length ? `Cartons: ${item.cartonNos.join(", ")}` : null,
    ]
      .filter(Boolean)
      .join(" | ");

    const barcodeValue = generateBarcode(idx + 500);

    try {
      await prisma.product.upsert({
        where: { sku },
        update: {
          productName,
          baseStyleNumber: item.baseStyleNumber,
          styleNumber: sku,
          styleName: item.styleName,
          itemName: item.inventoryDesc,
          brand: item.brand,
          color: item.color,
          colorCode: item.colorCode,
          size: item.size,
          fabric: item.fabricComposition,
          fabricComposition: item.fabricComposition,
          fabricWeight: item.fabricWeight,
          stockQuantity: item.totalQuantity,
          description: fullDescription,
          categoryId,
        },
        create: {
          sku,
          productName,
          baseStyleNumber: item.baseStyleNumber,
          styleNumber: sku,
          styleName: item.styleName,
          itemName: item.inventoryDesc,
          brand: item.brand,
          color: item.color,
          colorCode: item.colorCode,
          size: item.size,
          fabric: item.fabricComposition,
          fabricComposition: item.fabricComposition,
          fabricWeight: item.fabricWeight,
          purchasePrice: 0.0,
          salePrice: 0.0,
          stockQuantity: item.totalQuantity,
          minStockAlert: 5,
          description: fullDescription,
          categoryId,
          barcodes: {
            create: {
              barcodeValue,
              barcodeType: "CODE128",
              barcodeSource: "GENERATED",
              isPrimary: true,
            },
          },
          transactions: {
            create: {
              transactionType: "STOCK_IN",
              quantity: item.totalQuantity,
              previousStock: 0,
              newStock: item.totalQuantity,
              notes: `Bulk import from packing list (Cartons: ${item.cartonNos.join(", ")})`,
              performedById: user.id,
            },
          },
        },
      });

      importedCount++;
    } catch (e) {
      console.error(`Error importing SKU ${sku}:`, e.message);
    }
  }

  console.log(`🎉 SUCCESS! ${importedCount} unique Nordic Prowear items fully imported into Neon DB!`);
}

importData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
