export default function HeroSection() {
  return (
    <section className="bg-blue-600 text-white py-16 px-8 md:py-24">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        <h1 className="text-4xl md:text-6xl font-bold leading-tight max-w-3xl">
          Rezerwacja miejsc na parkingu uniwersyteckim
        </h1>
        <p className="text-xl md:text-2xl text-blue-100 max-w-2xl">
          Zarezerwuj miejsce online — szybko i wygodnie
        </p>

        <div className="mt-4">
          <a
            href="#map"
            className="inline-block bg-white text-blue-600 font-semibold px-8 py-4 rounded-lg shadow-lg hover:bg-blue-50 transition-colors duration-200">
            Przejdź do mapy parkingu
          </a>
        </div>
      </div>
    </section>
  );
}
