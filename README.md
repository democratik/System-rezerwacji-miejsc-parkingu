# System rezerwacji miejsc parkingowych

Aplikacja webowa do rezerwacji miejsc na parkingu uniwersyteckim — interaktywna mapa parkingu, konta użytkowników, panel administratora oraz symulowany moduł płatności.

---

## Opis projektu i cel

**System rezerwacji miejsc parkingowych** umożliwia studentom i pracownikom uczelni rezerwację miejsc parkingowych online — szybko i bez kolejek. Aplikacja prezentuje interaktywną mapę parkingu, pozwala zarezerwować wolne miejsce na wybrany czas oraz opłacić rezerwację.

**Cel projektu:** uproszczenie i cyfryzacja procesu zajmowania miejsc na parkingu uczelnianym, ograniczenie chaosu i oszczędność czasu kierowców.

**Grupa docelowa:**

- **Studenci i pracownicy uczelni** — rezerwują miejsca parkingowe przez stronę użytkownika.
- **Administratorzy parkingu** — zarządzają miejscami i rezerwacjami w dedykowanym panelu administracyjnym.

### Główne funkcje

- Rejestracja i logowanie użytkowników (e-mail, imię, telefon, hasło).
- Interaktywna mapa parkingu — 100 miejsc w 4 sekcjach (A, B, C, D).
- Rezerwacja wolnego miejsca na czas od 30 minut do 24 godzin.
- Symulowany system płatności — karta płatnicza lub BLIK.
- Panel administratora — pulpit statystyk, zarządzanie rezerwacjami, mapa, dziennik zdarzeń.
- Ochrona dostępu (middleware) — bez zalogowania nie można korzystać z aplikacji.
- Oddzielne konta administratorów z dostępem wyłącznie do panelu administracyjnego.

---

## Stos technologiczny

Next.js 16.2.3 Framework — App Router, API, middleware
React 19.2.4 Biblioteka interfejsu użytkownika  
TypeScript 5.x Typowanie statyczne  
Tailwind CSS 4.x Stylowanie komponentów

Dane przechowywane są w plikach JSON (`data/`) — aplikacja nie wymaga zewnętrznej bazy danych.

---

## Instrukcja uruchomienia

### Wymagania wstępne

- **Node.js** w wersji 18.18 lub nowszej.
- Menedżer pakietów **npm** (instalowany razem z Node.js).
- **Git** — do sklonowania repozytorium.

### Krok 1 — Sklonowanie repozytorium

```bash
git clone <adres-repozytorium>
cd System-rezerwacji-miejsc-parkingu
```

### Krok 2 — Instalacja zależności

```bash
npm install
```

Polecenie pobiera wszystkie pakiety wymienione w `package.json` (Next.js, React, Tailwind CSS i inne)

### Krok 3 — Zmienne środowiskowe

Projekt **nie wymaga konfiguracji zmiennych środowiskowych** — działa od razu po instalacji. Dane logowania przechowywane są lokalnie w plikach JSON w katalogu `data/`

W razie potrzeby własnych ustawień można utworzyć plik `.env.local` w katalogu głównym (jest on ignorowany przez Git)

### Krok 4 — Uruchomienie aplikacji

Tryb deweloperski (z automatycznym przeładowaniem):

```bash
npm run dev
```

Aplikacja będzie dostępna pod adresem **http://localhost:3000**

### Pozostałe polecenia

```bash
npm run build    # zbudowanie wersji produkcyjnej
npm run start    # uruchomienie wersji produkcyjnej
npm run lint     # sprawdzenie jakości kodu (ESLint)
```

### Konta testowe

Administrator `admin` `admin123`
Użytkownik rejestracja na `/register` dowolne

Administrator loguje się loginem, użytkownik adresem e-mail — na tej samej stronie `/login`.

### Ścieżka użytkownika

1. Wejście na stronę — bez zalogowania następuje przekierowanie na `/login`.
2. Rejestracja konta na `/register` (e-mail, imię, telefon, hasło) lub logowanie.
3. Przeglądanie interaktywnej mapy parkingu na stronie głównej.
4. Kliknięcie wolnego (zielonego) miejsca — otwiera się okno rezerwacji.
5. Podanie imienia i wybór czasu rezerwacji, przejście do płatności.
6. Opłacenie rezerwacji (karta lub BLIK) — płatność symulowana.
7. Miejsce zostaje zarezerwowane i zmienia kolor na niebieski.

### Ścieżka administratora

1. Logowanie na `/login` loginem administratora.
2. Automatyczne przekierowanie do panelu `/AdminPanel`.
3. Zarządzanie rezerwacjami, mapą oraz przeglądanie statystyk i dziennika zdarzeń.

---

## Dostępne trasy

`/` Strona główna z interaktywną mapą parkingu  
 `/login` Logowanie użytkownika lub administratora  
 `/register` Rejestracja nowego użytkownika  
 `/payment` Strona płatności za rezerwację  
 `/AdminPanel` Panel administratora (tylko dla administratorów)

---

## Uwagi i ograniczenia

- Hasła przechowywane są w postaci jawnej (bez szyfrowania) — projekt ma charakter demonstracyjny
- Dane użytkowników i administratorów trzymane są w plikach JSON, a nie w bazie danych
- Stan rezerwacji przechowywany jest w pamięci i resetuje się po pełnym przeładowaniu strony
- Moduł płatności jest symulowany — nie realizuje rzeczywistych transakcji
