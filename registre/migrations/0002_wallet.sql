-- Pass Google Wallet : 1 quand le titulaire a demandé son pass (mise à jour à
-- l'amendement, invalidation et effacement des données à la suppression).
ALTER TABLE citizens ADD COLUMN wallet_google INTEGER NOT NULL DEFAULT 0;
