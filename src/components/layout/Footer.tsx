import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground mt-auto">
      <div className="mx-auto max-w-[1200px] px-4 py-10 md:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Info */}
          <div className="md:col-span-1">
            <h3 className="text-2xl font-extrabold text-primary-foreground mb-4 tracking-tight">
              Grosur
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Belanja kebutuhan harianmu dengan mudah, cepat, dan terpercaya.
              Langsung dikirim dari toko terdekat ke pintu rumahmu.
            </p>
          </div>

          {/* Links Sections */}
          <div>
            <h4 className="font-bold mb-4 text-primary-foreground">
              Layanan Pelanggan
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/bantuan"
                  className="hover:text-primary transition-colors"
                >
                  Pusat Bantuan
                </Link>
              </li>
              <li>
                <Link
                  href="/cara-belanja"
                  className="hover:text-primary transition-colors"
                >
                  Cara Belanja
                </Link>
              </li>
              <li>
                <Link
                  href="/pengembalian"
                  className="hover:text-primary transition-colors"
                >
                  Pengembalian Dana
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-primary-foreground">
              Tentang Kami
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/about"
                  className="hover:text-primary transition-colors"
                >
                  Profil Perusahaan
                </Link>
              </li>
              <li>
                <Link
                  href="/karir"
                  className="hover:text-primary transition-colors"
                >
                  Karir
                </Link>
              </li>
              <li>
                <Link
                  href="/syarat"
                  className="hover:text-primary transition-colors"
                >
                  Syarat & Ketentuan
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-primary-foreground">
              Hubungi Kami
            </h4>
            <p className="text-sm text-muted-foreground mb-2">cs@grosur.com</p>
            <p className="text-sm text-muted-foreground">0812-3456-7890</p>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="mt-10 border-t border-muted-foreground/20 pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Grosur. Hak Cipta Dilindungi.
        </div>
      </div>
    </footer>
  );
}
