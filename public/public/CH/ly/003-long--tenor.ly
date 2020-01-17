\header
    {
      tagline = ""  % removed
      title = "3. Come, Thou Almighty King "
      composer = " Felice de Giardini, 1769 "
      poet = " Anon., 1757 "
      subtitle = "6.6.4.6.6.6.4"
    }
    \version "2.18.2"
    %
    %% global for all staves
    %
global = { \key g \major \time 3/4 \tempo 4 = 100  }
%Individual voices

soprano = {d''4 b'4 g'4 a'4 (g'4) fis'4 g'2. g'4 a'4 b'4 c''8 (d''8 c''4) b'4 a'2. d''4 b'4 g'4 d'2. a'4 b'4 c''4 b'4. a'8 g'4 a'4 b'4 c''4 b'4. a'8 g'4 g'4 b'4 d''4 d''4. e''8 d''4 c''4 b'4 a'4 g'2.  d''4 b'4 g'4 a'4 (g'4) fis'4 g'2. g'4 a'4 b'4 c''8 (d''8 c''4) b'4 a'2. d''4 b'4 g'4 d'2. a'4 b'4 c''4 b'4. a'8 g'4 a'4 b'4 c''4 b'4. a'8 g'4 g'4 b'4 d''4 d''4. e''8 d''4 c''4 b'4 a'4 g'2.  d''4 b'4 g'4 a'4 (g'4) fis'4 g'2. g'4 a'4 b'4 c''8 (d''8 c''4) b'4 a'2. d''4 b'4 g'4 d'2. a'4 b'4 c''4 b'4. a'8 g'4 a'4 b'4 c''4 b'4. a'8 g'4 g'4 b'4 d''4 d''4. e''8 d''4 c''4 b'4 a'4 g'2.  }
alto = {g'4 g'4 g'4 e'4 (d'4) d'4 d'2. d'4 d'4 g'4 fis'4 (a'4) g'4 fis'2. d''4 b'4 g'4 d'2. fis'4 g'4 a'4 g'4. fis'8 g'4 fis'4 g'4 a'4 g'4. fis'8 g'4 d'4 d'4 g'4 g'4. g'8 g'4 a'4 g'4 fis'4 g'2.  g'4 g'4 g'4 e'4 (d'4) d'4 d'2. d'4 d'4 g'4 fis'4 (a'4) g'4 fis'2. d''4 b'4 g'4 d'2. fis'4 g'4 a'4 g'4. fis'8 g'4 fis'4 g'4 a'4 g'4. fis'8 g'4 d'4 d'4 g'4 g'4. g'8 g'4 a'4 g'4 fis'4 g'2.  g'4 g'4 g'4 e'4 (d'4) d'4 d'2. d'4 d'4 g'4 fis'4 (a'4) g'4 fis'2. d''4 b'4 g'4 d'2. fis'4 g'4 a'4 g'4. fis'8 g'4 fis'4 g'4 a'4 g'4. fis'8 g'4 d'4 d'4 g'4 g'4. g'8 g'4 a'4 g'4 fis'4 g'2.  }
tenor = {b4 d'4 d'4 c'4 (b4) a4 b2. b4 d'4 d'4 d'2 d'4 d'2. d'4 b4 g4 d2. d'4 d'4 d'4 d'4. c'8 b4 d'4 d'4 d'4 d'4. c'8 b4 b4 g4 b4 b4. c'8 b4 e'4 d'4 c'4 b2.  b4 d'4 d'4 c'4 (b4) a4 b2. b4 d'4 d'4 d'2 d'4 d'2. d'4 b4 g4 d2. d'4 d'4 d'4 d'4. c'8 b4 d'4 d'4 d'4 d'4. c'8 b4 b4 g4 b4 b4. c'8 b4 e'4 d'4 c'4 b2.  b4 d'4 d'4 c'4 (b4) a4 b2. b4 d'4 d'4 d'2 d'4 d'2. d'4 b4 g4 d2. d'4 d'4 d'4 d'4. c'8 b4 d'4 d'4 d'4 d'4. c'8 b4 b4 g4 b4 b4. c'8 b4 e'4 d'4 c'4 b2.  }
bass = {g4 g4 b,4 c4 (d4) d4 g,2. g4 fis4 g4 a4 (fis4) g4 d2. d'4 b4 g4 d2. d4 d4 d4 g4. g8 g4 d4 d4 d4 g4. g8 g4 g4 g4 g4 g4. g8 g4 c4 d4 d4 g,2.  g4 g4 b,4 c4 (d4) d4 g,2. g4 fis4 g4 a4 (fis4) g4 d2. d'4 b4 g4 d2. d4 d4 d4 g4. g8 g4 d4 d4 d4 g4. g8 g4 g4 g4 g4 g4. g8 g4 c4 d4 d4 g,2.  g4 g4 b,4 c4 (d4) d4 g,2. g4 fis4 g4 a4 (fis4) g4 d2. d'4 b4 g4 d2. d4 d4 d4 g4. g8 g4 d4 d4 d4 g4. g8 g4 g4 g4 g4 g4. g8 g4 c4 d4 d4 g,2.  }
%lyrics
stanzaa = \lyricmode { Come, Thou al- migh- ty King, Help us Thy name to sing, Help us to praise, Fa- ther all glo- ri- ous, O'er all vic- to- ri- ous, Come and reign o- ver us, An- cient of days. Come, ho- ly Com- for- ter, Thy sa- cred wit- ness bear In this glad hour: Thou who al- migh- ty art, Rule now in e- very heart, And ne'er from us de- part, Spi- rit of power. Thou art the migh- ty One, On earth Thy will be done From shore to shore. Thy sov- ereign ma- jes- ty May we in glo- ry see, And to e- ter- ni- ty Love and a- dore. }
\score {
      \new ChoirStaff <<
       \new Staff <<
\clef "treble"
      

      \new Lyrics \lyricsto "Tenor" { \stanzaa }

>>

        \new Staff <<
\clef "bass"
        \new Voice = "Tenor" { \voiceOne \global \tenor}

        \new Lyrics \lyricsto "Tenor" { \stanzaa }

>>

      >>
    \layout{}
    \midi{}
    }