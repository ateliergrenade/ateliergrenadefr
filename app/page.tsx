import { supabase } from "@/lib/supabase";
import { AteliersList } from "@/components/AteliersList";
import { ParallaxBanner } from "@/components/ParallaxBanner";

export default async function Home() {
  // Fetch ateliers from Supabase
  const { data: ateliers } = await supabase
    .from("ateliers")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8f5f2" }}>
      {/* Banner with Parallax Effect */}
      <ParallaxBanner />

      {/* Main Content */}
      <main className="relative z-0" style={{ backgroundColor: "#f8f5f2" }}>
        <div className="container mx-auto px-6 pt-4 md:pt-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* Title */}
            <h1
              className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight"
              style={{
                color: "#2d5a3d",
                fontFamily: "var(--font-playfair), serif",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                marginTop: "-1.5rem",
              }}
            >
              Atelier Grenade
            </h1>
            {/* Subtitle */}
            <p
              className="text-2xl md:text-3xl mb-12 font-semibold italic"
              style={{
                color: "#3d7a52",
                fontFamily: "var(--font-playfair), serif",
                fontWeight: 600
              }}
            >
              Maroquinerie Artisanale
            </p>
          </div>

          {/* Ateliers Section - Title centered */}
          <div className="max-w-5xl mx-auto text-center mb-0">
            <h2
              className="text-5xl md:text-6xl font-bold mb-2"
              style={{
                color: "#2d5a3d",
                fontFamily: "var(--font-playfair), serif",
                fontWeight: 700,
              }}
            >
              Les Ateliers
            </h2>
            <div
              className="w-24 h-1 mx-auto"
              style={{ background: "#c8102e" }}
            ></div>
          </div>
        </div>

        {/* Full-width carousel */}
        <div className="w-full mt-8">
          <AteliersList ateliers={ateliers || []} />
        </div>

        {/* À propos */}
        <div className="container mx-auto px-6 pt-16 md:pt-24 pb-16 md:pb-24">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2
                className="text-5xl md:text-6xl font-bold mb-2"
                style={{
                  color: "#2d5a3d",
                  fontFamily: "var(--font-playfair), serif",
                  fontWeight: 700,
                }}
              >
                À propos
              </h2>
              <div
                className="w-24 h-1 mx-auto"
                style={{ background: "#c8102e" }}
              ></div>
            </div>

            <div className="grid md:grid-cols-2 gap-x-12 gap-y-6">
              <div>
                <p
                  className="text-base md:text-lg leading-relaxed text-left mb-6"
                  style={{
                    color: "#1f2937",
                    fontFamily: "var(--font-crimson), serif",
                    lineHeight: "1.7"
                  }}
                >
                  Atelier Grenade, c'est un atelier de maroquinerie coloré et créatif, où le cuir devient le terrain de jeu de toutes les envies. On y cultive l'amour des matières naturelles, des couleurs vives et du fait-main. Chaque création raconte une histoire, la vôtre.
                </p>

                <p
                  className="text-base md:text-lg leading-relaxed text-left font-semibold mb-6"
                  style={{
                    color: "#2d5a3d",
                    fontFamily: "var(--font-crimson), serif",
                    lineHeight: "1.7"
                  }}
                >
                  Après plusieurs belles années passées dans l'Oise, Atelier Grenade arrive à Paris !
                </p>

                <p
                  className="text-base md:text-lg leading-relaxed text-left"
                  style={{
                    color: "#1f2937",
                    fontFamily: "var(--font-crimson), serif",
                    lineHeight: "1.7"
                  }}
                >
                  Une nouvelle étape pour partager encore plus largement le plaisir de créer, apprendre et fabriquer soi-même des pièces uniques.
                </p>
              </div>

              <div>
                <div className="mb-6">
                  <h3
                    className="text-xl md:text-2xl font-bold mb-3 text-left"
                    style={{
                      color: "#2d5a3d",
                      fontFamily: "var(--font-playfair), serif",
                    }}
                  >
                    Des ateliers accessibles à tous
                  </h3>
                  <p
                    className="text-base md:text-lg leading-relaxed text-left"
                    style={{
                      color: "#1f2937",
                      fontFamily: "var(--font-crimson), serif",
                      lineHeight: "1.7"
                    }}
                  >
                    Que vous soyez débutant curieux ou passionné, les ateliers sont pensés pour être simples, ludiques et accessibles. Ils se déroulent dans des lieux sympas et inspirants, propices à la créativité, ou directement à domicile pour un moment convivial et sur mesure.
                  </p>
                </div>

                <div>
                  <h3
                    className="text-xl md:text-2xl font-bold mb-3 text-left"
                    style={{
                      color: "#2d5a3d",
                      fontFamily: "var(--font-playfair), serif",
                    }}
                  >
                    Venez créer, apprendre et vous amuser
                  </h3>
                  <p
                    className="text-base md:text-lg leading-relaxed text-left"
                    style={{
                      color: "#1f2937",
                      fontFamily: "var(--font-crimson), serif",
                      lineHeight: "1.7"
                    }}
                  >
                    Chez Atelier Grenade, chaque session est une parenthèse joyeuse : on découvre, on échange, on s'amuse, et on repart avec sa propre création, fièrement confectionnée à la main de la couture à la finition.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
