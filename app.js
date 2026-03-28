const STORAGE_KEY = "one-piece-creator-vote-demo";
const LANGUAGE_STORAGE_KEY = "vote-page-language";
const SUBMISSION_ENDPOINT = window.VOTE_PAGE_CONFIG?.submissionEndpoint ?? "";
const APPROVED_ENDPOINT = SUBMISSION_ENDPOINT ? `${SUBMISSION_ENDPOINT}?action=approved` : "";
const LANGUAGE_CODES = ["en", "es", "fr", "pt", "ja", "zh", "ko", "hi", "it", "id", "ar"];
const RTL_LANGUAGES = new Set(["ar"]);

const seedCreators = [
  { id: crypto.randomUUID(), name: "Tekking101", platform: "Influencers", region: "https://www.youtube.com/@Tekking101", pitch: "Deep lore dives, chaotic energy, and years of consistent ZoNami coverage." },
  { id: crypto.randomUUID(), name: "The Drawk Show", platform: "Influencers", region: "https://www.youtube.com/@TheDrawkShow", pitch: "Fast reactions, chapter discussion, and strong community engagement." },
  { id: crypto.randomUUID(), name: "GrandLineReview", platform: "Writers", region: "https://www.youtube.com/@GrandLineReview", pitch: "Sharp editing, accessible breakdowns, and reliable series coverage." },
  { id: crypto.randomUUID(), name: "Merphy Napier", platform: "Writers", region: "https://www.youtube.com/@MerphyNapier42", pitch: "Fresh-reader perspective with emotional analysis and thoughtful reactions." },
  { id: crypto.randomUUID(), name: "Randy Troy", platform: "Influencers", region: "https://www.youtube.com/@RandyTroy", pitch: "Strong live discussions, theory talk, and event-level fandom energy." },
  { id: crypto.randomUUID(), name: "King Recon", platform: "Illustrator", region: "https://www.youtube.com/@KingRecon", pitch: "Long-form chapter streams and veteran ZoNami community presence." }
];

const translations = {
  en: {
    languageLabel: "Language",
    brandServer: "ZoNa Nakama Discord Server",
    brandAwards: "ZN CONTENT CREATOR AWARDS",
    heroTitle: "ZN CONTENT CREATORS",
    heroCta: "Suggest Now",
    currentVoteCount: "Current Vote Count",
    proposedCreators: "Proposed creators:",
    introTitle: "Who Is Your<br />Favorite ZoNami Creator",
    introBody: 'The <a href="https://discord.gg/8rcrtwQWV7" target="_blank" rel="noreferrer noopener">ZoNa Nakama Discord server</a> is here to celebrate the creators who keep the Zoro x Nami fandom active, creative, and fun.',
    phaseDescription: "Submit your favorite creator so we can spotlight them in the community celebration.",
    joinEvent: "Join The Event",
    suggestionPeriod: "Suggestion Period",
    creatorName: "Creator name",
    creatorNamePlaceholder: "ZoNamiLover",
    category: "Category",
    categoryPlaceholder: "Select a category",
    link: "Link",
    linkPlaceholder: "https://example.com/profile",
    reason: "Why should they be included?",
    reasonPlaceholder: "Explain what makes this creator special to ZoNami fans.",
    submitSuggestion: "Submit Suggestion",
    submitting: "Submitting",
    sendingSuggestion: "Sending your suggestion...",
    loadingBody: "Please wait while we save it for the mods to review.",
    suggestionReceived: "Suggestion Received",
    successBody: "The mods will review your suggestion.",
    suggestAgain: "Suggest Again",
    creatorRanking: "Creator Spotlight",
    suggestedCreators: "Featured Creators",
    slideshow: "Random",
    artists: "Illustrators",
    influencers: "Influencers",
    writers: "Writers",
    rules: "Rules",
    rulesTitle: "How Participation Works",
    eventHighlights: "Event Highlights",
    rewardsTitle: "What Happens Next",
    discordKicker: "Join The Crew",
    discordTitle: "Calling all ZoNa shippers!",
    discordBody: "Board our Discord and sail with us for all things Zoro x Nami.",
    discordCta: "Join the Server",
    suggestionStage: "Suggestion Stage",
    suggestionStageBody: "Fans can build the ballot by proposing creators before voting opens.",
    dailyVoting: "Daily Voting",
    dailyVotingBody: "Once voting opens, fans can come back each day to support their favorites.",
    rankingReveal: "Final Results",
    rankingRevealBody: "The final results will be shared, and the winners will be announced and celebrated by the community.",
    fillFields: "Fill in every field before sending a suggestion.",
    withoutAt: 'Enter the creator name without "@".',
    sending: "Sending...",
    submitError: "Could not submit the suggestion.",
    noCreators: "No creators found.",
    thankYou: "Thank you for suggesting {name}!",
    rule1: '<span class="rule-phase">Submission Phase</span><br /><br />Fans can submit their favorite creators in three categories, and each submission should include a link that shows the work that fits the category.<br /><br /><span class="rule-detail"><strong>Illustrators</strong>: fanart, illustrations, and drawings.</span><br /><span class="rule-detail"><strong>Writers</strong>: fanfics and other written ZoNami works.</span><br /><span class="rule-detail"><strong>Influencers</strong>: fans who actively share and support ZoNami across social media.</span><br /><br />You can suggest creators from Twitter, TikTok, Instagram, Tumblr, AO3, and other platforms.',
    rule2: '<span class="rule-phase">Review Phase</span><br /><br />The mods review every submission, check for duplicates, and approve the creators who should appear in the Creator Spotlight.',
    rule3: '<span class="rule-phase">Voting Phase</span><br /><br />When voting opens, everyone will be able to vote once a day for one favorite creator in each category.',
    rule4: '<span class="rule-phase">Announcing the Winners</span><br /><br />When the poll closes, the winners will be announced for the whole fandom to celebrate together.',
    profileLink: "Link",
    categories: { Illustrator: "Illustrator", Influencers: "Influencers", Writers: "Writers" }
  },
  fr: {
    languageLabel: "Langue",
    brandServer: "Serveur Discord ZoNa Nakama",
    brandAwards: "PRIX ZN CONTENT CREATOR",
    heroTitle: "ZN CONTENT CREATORS",
    heroCta: "Proposer",
    currentVoteCount: "Nombre actuel de votes",
    proposedCreators: "Createurs proposes :",
    introTitle: "Qui est votre<br />createur ZoNami prefere ?",
    introBody: 'Le <a href="https://discord.gg/8rcrtwQWV7" target="_blank" rel="noreferrer noopener">serveur Discord ZoNa Nakama</a> est la pour celebrer les createurs qui font vivre le fandom Zoro x Nami avec leur energie, leur creativite et leur passion.',
    phaseDescription: "Proposez votre createur prefere afin que nous puissions le mettre en avant dans cette celebration de la communaute.",
    joinEvent: "Rejoindre l'evenement",
    suggestionPeriod: "Periode de suggestions",
    creatorName: "Nom du createur",
    creatorNamePlaceholder: "ZoNamiLover",
    category: "Categorie",
    categoryPlaceholder: "Choisissez une categorie",
    link: "Lien",
    linkPlaceholder: "https://example.com/profile",
    reason: "Pourquoi devrait-il etre inclus ?",
    reasonPlaceholder: "Expliquez ce qui rend ce createur special pour les fans de ZoNami.",
    submitSuggestion: "Envoyer la suggestion",
    submitting: "Envoi",
    sendingSuggestion: "Envoi de votre suggestion...",
    loadingBody: "Veuillez patienter pendant que nous l'enregistrons pour les moderateurs.",
    suggestionReceived: "Suggestion recue",
    successBody: "Les moderateurs examineront votre suggestion.",
    suggestAgain: "Proposer a nouveau",
    creatorRanking: "Projecteur createur",
    suggestedCreators: "Createurs mis en avant",
    slideshow: "Aleatoire",
    artists: "Illustrateurs",
    influencers: "Influenceurs",
    writers: "Auteurs",
    rules: "Regles",
    rulesTitle: "Comment participer",
    eventHighlights: "Temps forts",
    rewardsTitle: "La suite de l'evenement",
    discordKicker: "Rejoignez l'equipage",
    discordTitle: "Appel a tous les shippers ZoNa !",
    discordBody: "Montez a bord de notre Discord et naviguez avec nous pour tout ce qui touche a Zoro x Nami.",
    discordCta: "Rejoindre le serveur",
    suggestionStage: "Phase de suggestion",
    suggestionStageBody: "Les fans peuvent construire la liste en proposant des createurs avant l'ouverture du vote.",
    dailyVoting: "Vote quotidien",
    dailyVotingBody: "Une fois le vote ouvert, les fans pourront revenir chaque jour pour soutenir leurs favoris.",
    rankingReveal: "Resultats finaux",
    rankingRevealBody: "Les resultats finaux seront partages, et les gagnants seront annonces et celebres par la communaute.",
    fillFields: "Remplissez tous les champs avant d'envoyer une suggestion.",
    withoutAt: 'Saisissez le nom du createur sans "@".',
    sending: "Envoi...",
    submitError: "Impossible d'envoyer la suggestion.",
    noCreators: "Aucun createur trouve.",
    thankYou: "Merci d'avoir propose {name} !",
    rule1: '<span class="rule-phase">Phase de soumission</span><br /><br />Les fans peuvent proposer leurs createurs favoris dans trois categories, et chaque suggestion doit inclure un lien montrant bien le travail correspondant a la categorie choisie.<br /><br /><span class="rule-detail"><strong>Illustrateurs</strong> : fanarts, illustrations et dessins.</span><br /><span class="rule-detail"><strong>Auteurs</strong> : fanfics et autres oeuvres ecrites ZoNami.</span><br /><span class="rule-detail"><strong>Influenceurs</strong> : fans qui partagent et soutiennent activement ZoNami sur les reseaux sociaux.</span><br /><br />Vous pouvez proposer des createurs venant de Twitter, TikTok, Instagram, Tumblr, AO3 et d\'autres plateformes.',
    rule2: '<span class="rule-phase">Phase de verification</span><br /><br />Les moderateurs examinent chaque suggestion, verifient les doublons et approuvent les createurs qui doivent apparaitre dans le Creator Spotlight.',
    rule3: '<span class="rule-phase">Phase de vote</span><br /><br />Lorsque le vote ouvrira, chacun pourra voter une fois par jour pour un createur favori dans chaque categorie.',
    rule4: '<span class="rule-phase">Annonce des gagnants</span><br /><br />Quand le sondage sera termine, les gagnants seront annonces pour que tout le fandom puisse celebrer ensemble.',
    profileLink: "Lien",
    categories: { Illustrator: "Illustrateur", Influencers: "Influenceurs", Writers: "Auteurs" }
  },
  es: {
    languageLabel: "Idioma",
    brandServer: "Servidor de Discord ZoNa Nakama",
    brandAwards: "PREMIOS ZN CONTENT CREATORS",
    heroTitle: "CREADORES DE CONTENIDO ZN",
    heroCta: "Sugerir ahora",
    currentVoteCount: "Conteo actual de votos",
    proposedCreators: "Creadores propuestos:",
    introTitle: "¿Quién es tu<br />creador favorito de ZoNami?",
    introBody: 'El <a href="https://discord.gg/8rcrtwQWV7" target="_blank" rel="noreferrer noopener">servidor de Discord ZoNa Nakama</a> está aquí para celebrar a los creadores que mantienen vivo, creativo y divertido el fandom de Zoro x Nami.',
    phaseDescription: "Envía a tu creador favorito para que podamos destacarlo en esta celebración de la comunidad.",
    joinEvent: "Únete al evento",
    suggestionPeriod: "Periodo de sugerencias",
    creatorName: "Nombre del creador",
    creatorNamePlaceholder: "ZoNamiLover",
    category: "Categoría",
    categoryPlaceholder: "Selecciona una categoría",
    link: "Enlace",
    linkPlaceholder: "https://example.com/profile",
    reason: "¿Por qué debería ser incluido?",
    reasonPlaceholder: "Explica qué hace especial a este creador para los fans de ZoNami.",
    submitSuggestion: "Enviar sugerencia",
    submitting: "Enviando",
    sendingSuggestion: "Enviando tu sugerencia...",
    loadingBody: "Espera mientras la guardamos para que los mods la revisen.",
    suggestionReceived: "Sugerencia recibida",
    successBody: "Los mods revisarán tu sugerencia.",
    suggestAgain: "Sugerir otra vez",
    creatorRanking: "Spotlight de creadores",
    suggestedCreators: "Creadores destacados",
    slideshow: "Aleatorio",
    artists: "Ilustradores",
    influencers: "Influencers",
    writers: "Escritores",
    rules: "Reglas",
    rulesTitle: "Cómo funciona la participación",
    eventHighlights: "Lo más destacado",
    rewardsTitle: "Lo que viene después",
    discordKicker: "Únete a la tripulación",
    discordTitle: "¡Llamando a todos los shippers de ZoNa!",
    discordBody: "Sube a nuestro Discord y navega con nosotros por todo lo relacionado con Zoro x Nami.",
    discordCta: "Unirse al servidor",
    suggestionStage: "Etapa de sugerencias",
    suggestionStageBody: "Los fans pueden construir la lista proponiendo creadores antes de que se abra la votación.",
    dailyVoting: "Votación diaria",
    dailyVotingBody: "Cuando se abra la votación, los fans podrán volver cada día para apoyar a sus favoritos.",
    rankingReveal: "Resultados finales",
    rankingRevealBody: "Los resultados finales se compartirán y los ganadores serán anunciados y celebrados por la comunidad.",
    fillFields: "Completa todos los campos antes de enviar una sugerencia.",
    withoutAt: 'Escribe el nombre del creador sin "@".',
    sending: "Enviando...",
    submitError: "No se pudo enviar la sugerencia.",
    noCreators: "No se encontraron creadores.",
    thankYou: "¡Gracias por sugerir a {name}!",
    rule1: '<span class="rule-phase">Fase de envío</span><br /><br />Los fans pueden proponer a sus creadores favoritos en tres categorías, y cada sugerencia debe incluir un enlace que muestre el trabajo que encaja con la categoría elegida.<br /><br /><span class="rule-detail"><strong>Ilustradores</strong>: fanart, ilustraciones y dibujos.</span><br /><span class="rule-detail"><strong>Escritores</strong>: fanfics y otros trabajos escritos de ZoNami.</span><br /><span class="rule-detail"><strong>Influencers</strong>: fans que comparten y apoyan activamente a ZoNami en redes sociales.</span><br /><br />Puedes sugerir creadores de Twitter, TikTok, Instagram, Tumblr, AO3 y otras plataformas.',
    rule2: '<span class="rule-phase">Fase de revisión</span><br /><br />Los mods revisan cada sugerencia, comprueban duplicados y aprueban a los creadores que deben aparecer en el Creator Spotlight.',
    rule3: '<span class="rule-phase">Fase de votación</span><br /><br />Cuando se abra la votación, todo el mundo podrá votar una vez al día por un creador favorito en cada categoría.',
    rule4: '<span class="rule-phase">Anuncio de ganadores</span><br /><br />Cuando la encuesta cierre, se anunciará a los ganadores para que todo el fandom pueda celebrarlo junto.',
    profileLink: "Enlace",
    categories: { Illustrator: "Ilustrador", Influencers: "Influencers", Writers: "Escritores" }
  },
  pt: {
    languageLabel: "Idioma",
    brandServer: "Servidor do Discord ZoNa Nakama",
    brandAwards: "PRÊMIOS ZN CONTENT CREATORS",
    heroTitle: "CRIADORES DE CONTEÚDO ZN",
    heroCta: "Sugerir agora",
    currentVoteCount: "Contagem atual de votos",
    proposedCreators: "Criadores sugeridos:",
    introTitle: "Quem é o seu<br />criador favorito de ZoNami?",
    introBody: 'O <a href="https://discord.gg/8rcrtwQWV7" target="_blank" rel="noreferrer noopener">servidor do Discord ZoNa Nakama</a> está aqui para celebrar os criadores que mantêm o fandom de Zoro x Nami ativo, criativo e divertido.',
    phaseDescription: "Envie o seu criador favorito para que possamos destacá-lo nesta celebração da comunidade.",
    joinEvent: "Entre no evento",
    suggestionPeriod: "Período de sugestões",
    creatorName: "Nome do criador",
    creatorNamePlaceholder: "ZoNamiLover",
    category: "Categoria",
    categoryPlaceholder: "Selecione uma categoria",
    link: "Link",
    linkPlaceholder: "https://example.com/profile",
    reason: "Por que ele deve ser incluído?",
    reasonPlaceholder: "Explique o que torna este criador especial para os fãs de ZoNami.",
    submitSuggestion: "Enviar sugestão",
    submitting: "Enviando",
    sendingSuggestion: "Enviando sua sugestão...",
    loadingBody: "Aguarde enquanto salvamos isso para a moderação revisar.",
    suggestionReceived: "Sugestão recebida",
    successBody: "A moderação vai revisar a sua sugestão.",
    suggestAgain: "Sugerir novamente",
    creatorRanking: "Destaque de criadores",
    suggestedCreators: "Criadores em destaque",
    slideshow: "Aleatório",
    artists: "Ilustradores",
    influencers: "Influenciadores",
    writers: "Escritores",
    rules: "Regras",
    rulesTitle: "Como a participação funciona",
    eventHighlights: "Destaques do evento",
    rewardsTitle: "O que acontece depois",
    discordKicker: "Junte-se à tripulação",
    discordTitle: "Chamando todos os shippers de ZoNa!",
    discordBody: "Entre no nosso Discord e navegue com a gente por tudo sobre Zoro x Nami.",
    discordCta: "Entrar no servidor",
    suggestionStage: "Etapa de sugestões",
    suggestionStageBody: "Os fãs podem montar a votação sugerindo criadores antes da abertura da votação.",
    dailyVoting: "Votação diária",
    dailyVotingBody: "Quando a votação abrir, os fãs poderão voltar todos os dias para apoiar seus favoritos.",
    rankingReveal: "Resultados finais",
    rankingRevealBody: "Os resultados finais serão compartilhados, e os vencedores serão anunciados e celebrados pela comunidade.",
    fillFields: "Preencha todos os campos antes de enviar uma sugestão.",
    withoutAt: 'Digite o nome do criador sem "@".',
    sending: "Enviando...",
    submitError: "Não foi possível enviar a sugestão.",
    noCreators: "Nenhum criador encontrado.",
    thankYou: "Obrigado por sugerir {name}!",
    rule1: '<span class="rule-phase">Fase de envio</span><br /><br />Os fãs podem sugerir seus criadores favoritos em três categorias, e cada sugestão deve incluir um link que mostre o trabalho que combina com a categoria escolhida.<br /><br /><span class="rule-detail"><strong>Ilustradores</strong>: fanarts, ilustrações e desenhos.</span><br /><span class="rule-detail"><strong>Escritores</strong>: fanfics e outras obras escritas de ZoNami.</span><br /><span class="rule-detail"><strong>Influenciadores</strong>: fãs que compartilham e apoiam ZoNami ativamente nas redes sociais.</span><br /><br />Você pode sugerir criadores do Twitter, TikTok, Instagram, Tumblr, AO3 e outras plataformas.',
    rule2: '<span class="rule-phase">Fase de revisão</span><br /><br />A moderação revisa cada sugestão, verifica duplicatas e aprova os criadores que devem aparecer no Creator Spotlight.',
    rule3: '<span class="rule-phase">Fase de votação</span><br /><br />Quando a votação abrir, todos poderão votar uma vez por dia em um criador favorito de cada categoria.',
    rule4: '<span class="rule-phase">Anúncio dos vencedores</span><br /><br />Quando a votação terminar, os vencedores serão anunciados para que todo o fandom possa comemorar junto.',
    profileLink: "Link",
    categories: { Illustrator: "Ilustrador", Influencers: "Influenciadores", Writers: "Escritores" }
  },
  ja: {
    languageLabel: "言語",
    brandServer: "ZoNa Nakama Discordサーバー",
    brandAwards: "ZNコンテンツクリエイター賞",
    heroTitle: "ZNコンテンツクリエイターズ",
    heroCta: "今すぐ推薦",
    currentVoteCount: "現在の投票数",
    proposedCreators: "推薦されたクリエイター:",
    introTitle: "あなたの<br />お気に入りのZoNamiクリエイターは？",
    introBody: '<a href="https://discord.gg/8rcrtwQWV7" target="_blank" rel="noreferrer noopener">ZoNa Nakama Discordサーバー</a>は、Zoro x Nami fandomを楽しく、創造的で、活気あるものにしてくれているクリエイターたちを称えるためにあります。',
    phaseDescription: "お気に入りのクリエイターを推薦して、コミュニティのお祝いでスポットライトを当てましょう。",
    joinEvent: "イベントに参加",
    suggestionPeriod: "推薦期間",
    creatorName: "クリエイター名",
    creatorNamePlaceholder: "ZoNamiLover",
    category: "カテゴリー",
    categoryPlaceholder: "カテゴリーを選択",
    link: "リンク",
    linkPlaceholder: "https://example.com/profile",
    reason: "推薦したい理由",
    reasonPlaceholder: "このクリエイターがZoNamiファンにとって特別な理由を書いてください。",
    submitSuggestion: "推薦を送信",
    submitting: "送信中",
    sendingSuggestion: "推薦を送信しています...",
    loadingBody: "モデレーターが確認できるように保存しています。少々お待ちください。",
    suggestionReceived: "推薦を受け付けました",
    successBody: "モデレーターがあなたの推薦を確認します。",
    suggestAgain: "もう一度推薦する",
    creatorRanking: "クリエイタースポットライト",
    suggestedCreators: "注目のクリエイター",
    slideshow: "ランダム",
    artists: "イラストレーター",
    influencers: "インフルエンサー",
    writers: "ライター",
    rules: "ルール",
    rulesTitle: "参加方法",
    eventHighlights: "イベント概要",
    rewardsTitle: "このあとどうなる？",
    discordKicker: "仲間に加わろう",
    discordTitle: "ZoNaシッパーのみんな、集合！",
    discordBody: "Discordに乗り込んで、Zoro x Namiのすべてを一緒に楽しみましょう。",
    discordCta: "サーバーに参加",
    suggestionStage: "推薦ステージ",
    suggestionStageBody: "投票が始まる前に、ファンがクリエイターを推薦して候補を作ります。",
    dailyVoting: "毎日の投票",
    dailyVotingBody: "投票が始まったら、ファンは毎日戻ってお気に入りを応援できます。",
    rankingReveal: "最終結果",
    rankingRevealBody: "最終結果が公開され、受賞者はコミュニティから祝福されます。",
    fillFields: "推薦を送る前にすべての項目を入力してください。",
    withoutAt: 'クリエイター名は「@」なしで入力してください。',
    sending: "送信中...",
    submitError: "推薦を送信できませんでした。",
    noCreators: "クリエイターが見つかりません。",
    thankYou: "{name} を推薦してくれてありがとう！",
    rule1: '<span class="rule-phase">推薦フェーズ</span><br /><br />ファンは3つのカテゴリーでお気に入りのクリエイターを推薦できます。各推薦には、選んだカテゴリーに合う作品が見られるリンクを含めてください。<br /><br /><span class="rule-detail"><strong>イラストレーター</strong>: ファンアート、イラスト、ドローイング。</span><br /><span class="rule-detail"><strong>ライター</strong>: ファンフィックやその他のZoNami文章作品。</span><br /><span class="rule-detail"><strong>インフルエンサー</strong>: SNSで積極的にZoNamiを広め、応援しているファン。</span><br /><br />Twitter、TikTok、Instagram、Tumblr、AO3など、さまざまなプラットフォームから推薦できます。',
    rule2: '<span class="rule-phase">審査フェーズ</span><br /><br />モデレーターがすべての推薦を確認し、重複をチェックしたうえで、Creator Spotlightに載せるクリエイターを承認します。',
    rule3: '<span class="rule-phase">投票フェーズ</span><br /><br />投票が始まると、誰でも各カテゴリーで1日1回、お気に入りのクリエイターに投票できます。',
    rule4: '<span class="rule-phase">受賞者発表</span><br /><br />投票が終了したら、受賞者が発表され、ファンダムみんなで一緒にお祝いします。',
    profileLink: "リンク",
    categories: { Illustrator: "イラストレーター", Influencers: "インフルエンサー", Writers: "ライター" }
  },
  zh: {
    languageLabel: "语言",
    brandServer: "ZoNa Nakama Discord 服务器",
    brandAwards: "ZN内容创作者奖",
    heroTitle: "ZN内容创作者",
    heroCta: "立即推荐",
    currentVoteCount: "当前票数",
    proposedCreators: "已推荐创作者：",
    introTitle: "谁是你最喜欢的<br />ZoNami创作者？",
    introBody: '<a href="https://discord.gg/8rcrtwQWV7" target="_blank" rel="noreferrer noopener">ZoNa Nakama Discord 服务器</a>希望庆祝那些让 Zoro x Nami 同人圈保持活跃、富有创意又充满乐趣的创作者。',
    phaseDescription: "推荐你最喜欢的创作者，让他们在社区庆典中获得聚光灯。",
    joinEvent: "加入活动",
    suggestionPeriod: "推荐阶段",
    creatorName: "创作者名称",
    creatorNamePlaceholder: "ZoNamiLover",
    category: "类别",
    categoryPlaceholder: "选择一个类别",
    link: "链接",
    linkPlaceholder: "https://example.com/profile",
    reason: "为什么应该入选？",
    reasonPlaceholder: "请说明这位创作者为什么对 ZoNami 粉丝来说很特别。",
    submitSuggestion: "提交推荐",
    submitting: "提交中",
    sendingSuggestion: "正在提交你的推荐...",
    loadingBody: "请稍候，我们正在保存，以便管理员审核。",
    suggestionReceived: "已收到推荐",
    successBody: "管理员会审核你的推荐。",
    suggestAgain: "再次推荐",
    creatorRanking: "创作者聚光灯",
    suggestedCreators: "精选创作者",
    slideshow: "随机",
    artists: "画师",
    influencers: "推广者",
    writers: "写手",
    rules: "规则",
    rulesTitle: "参与方式",
    eventHighlights: "活动亮点",
    rewardsTitle: "接下来会发生什么",
    discordKicker: "加入船员",
    discordTitle: "ZoNa shipper 们集合！",
    discordBody: "登上我们的 Discord，一起聊遍所有 Zoro x Nami 相关内容。",
    discordCta: "加入服务器",
    suggestionStage: "推荐阶段",
    suggestionStageBody: "在投票开始前，粉丝可以通过推荐创作者来建立候选名单。",
    dailyVoting: "每日投票",
    dailyVotingBody: "投票开放后，粉丝每天都可以回来支持自己的最爱。",
    rankingReveal: "最终结果",
    rankingRevealBody: "最终结果将会公布，获奖者也会由社区一起庆祝。",
    fillFields: "提交推荐前请填写所有字段。",
    withoutAt: '请输入不带“@”的创作者名称。',
    sending: "提交中...",
    submitError: "无法提交推荐。",
    noCreators: "未找到创作者。",
    thankYou: "感谢你推荐 {name}！",
    rule1: '<span class="rule-phase">提交阶段</span><br /><br />粉丝可以在三个类别中推荐自己喜欢的创作者，每条推荐都应附上一个能展示该类别作品的链接。<br /><br /><span class="rule-detail"><strong>画师</strong>：同人图、插画和绘画作品。</span><br /><span class="rule-detail"><strong>写手</strong>：同人文和其他 ZoNami 文字作品。</span><br /><span class="rule-detail"><strong>推广者</strong>：在社交媒体上积极分享并支持 ZoNami 的粉丝。</span><br /><br />你可以推荐来自 Twitter、TikTok、Instagram、Tumblr、AO3 等平台的创作者。',
    rule2: '<span class="rule-phase">审核阶段</span><br /><br />管理员会审核每一条推荐、检查重复项，并批准应该出现在 Creator Spotlight 中的创作者。',
    rule3: '<span class="rule-phase">投票阶段</span><br /><br />投票开启后，每个人每天都可以在每个类别中为自己最喜欢的一位创作者投一票。',
    rule4: '<span class="rule-phase">公布获奖者</span><br /><br />投票结束后，将公布获奖者，让整个同人圈一起庆祝。',
    profileLink: "链接",
    categories: { Illustrator: "画师", Influencers: "推广者", Writers: "写手" }
  },
  ko: {
    languageLabel: "언어",
    brandServer: "ZoNa Nakama 디스코드 서버",
    brandAwards: "ZN 콘텐츠 크리에이터 어워즈",
    heroTitle: "ZN 콘텐츠 크리에이터",
    heroCta: "지금 추천하기",
    currentVoteCount: "현재 투표 수",
    proposedCreators: "추천된 크리에이터:",
    introTitle: "당신이 가장 좋아하는<br />ZoNami 크리에이터는?",
    introBody: '<a href="https://discord.gg/8rcrtwQWV7" target="_blank" rel="noreferrer noopener">ZoNa Nakama 디스코드 서버</a>는 Zoro x Nami 팬덤을 활기차고 창의적이며 즐겁게 만들어 주는 크리에이터들을 기념하기 위해 만들어졌습니다.',
    phaseDescription: "좋아하는 크리에이터를 추천해서 커뮤니티 축하 페이지에서 스포트라이트를 받을 수 있게 해 주세요.",
    joinEvent: "이벤트 참여하기",
    suggestionPeriod: "추천 기간",
    creatorName: "크리에이터 이름",
    creatorNamePlaceholder: "ZoNamiLover",
    category: "카테고리",
    categoryPlaceholder: "카테고리 선택",
    link: "링크",
    linkPlaceholder: "https://example.com/profile",
    reason: "왜 포함되어야 하나요?",
    reasonPlaceholder: "이 크리에이터가 ZoNami 팬들에게 왜 특별한지 설명해 주세요.",
    submitSuggestion: "추천 제출",
    submitting: "제출 중",
    sendingSuggestion: "추천을 보내는 중...",
    loadingBody: "모더레이터가 검토할 수 있도록 저장하고 있습니다. 잠시만 기다려 주세요.",
    suggestionReceived: "추천이 접수되었습니다",
    successBody: "모더레이터가 당신의 추천을 검토할 예정입니다.",
    suggestAgain: "다시 추천하기",
    creatorRanking: "크리에이터 스포트라이트",
    suggestedCreators: "추천 크리에이터",
    slideshow: "랜덤",
    artists: "일러스트레이터",
    influencers: "인플루언서",
    writers: "작가",
    rules: "규칙",
    rulesTitle: "참여 방법",
    eventHighlights: "이벤트 하이라이트",
    rewardsTitle: "다음 단계",
    discordKicker: "크루에 합류하기",
    discordTitle: "모든 ZoNa 시퍼들, 승선하세요!",
    discordBody: "우리 디스코드에 올라타서 Zoro x Nami에 관한 모든 것을 함께 즐겨요.",
    discordCta: "서버 참여하기",
    suggestionStage: "추천 단계",
    suggestionStageBody: "투표가 열리기 전에 팬들이 크리에이터를 추천해 후보를 만듭니다.",
    dailyVoting: "일일 투표",
    dailyVotingBody: "투표가 시작되면 팬들은 매일 돌아와 자신의 최애를 응원할 수 있습니다.",
    rankingReveal: "최종 결과",
    rankingRevealBody: "최종 결과가 공개되고, 우승자들은 커뮤니티의 축하를 받게 됩니다.",
    fillFields: "추천을 보내기 전에 모든 항목을 입력해 주세요.",
    withoutAt: '크리에이터 이름은 "@" 없이 입력해 주세요.',
    sending: "보내는 중...",
    submitError: "추천을 제출할 수 없습니다.",
    noCreators: "크리에이터를 찾을 수 없습니다.",
    thankYou: "{name} 님을 추천해 주셔서 감사합니다!",
    rule1: '<span class="rule-phase">추천 단계</span><br /><br />팬들은 세 가지 카테고리에서 좋아하는 크리에이터를 추천할 수 있으며, 각 추천에는 해당 카테고리에 맞는 작품을 보여 주는 링크가 포함되어야 합니다.<br /><br /><span class="rule-detail"><strong>일러스트레이터</strong>: 팬아트, 일러스트, 드로잉.</span><br /><span class="rule-detail"><strong>작가</strong>: 팬픽과 기타 ZoNami 글 작품.</span><br /><span class="rule-detail"><strong>인플루언서</strong>: 소셜 미디어에서 ZoNami를 적극적으로 공유하고 응원하는 팬들.</span><br /><br />Twitter, TikTok, Instagram, Tumblr, AO3 등 다양한 플랫폼의 크리에이터를 추천할 수 있습니다.',
    rule2: '<span class="rule-phase">검토 단계</span><br /><br />모더레이터가 모든 추천을 검토하고 중복을 확인한 뒤, Creator Spotlight에 올라갈 크리에이터를 승인합니다.',
    rule3: '<span class="rule-phase">투표 단계</span><br /><br />투표가 열리면 누구나 각 카테고리에서 하루에 한 번씩 가장 좋아하는 크리에이터에게 투표할 수 있습니다.',
    rule4: '<span class="rule-phase">우승자 발표</span><br /><br />투표가 끝나면 우승자가 발표되고, 팬덤 전체가 함께 축하하게 됩니다.',
    profileLink: "링크",
    categories: { Illustrator: "일러스트레이터", Influencers: "인플루언서", Writers: "작가" }
  },
  hi: {
    languageLabel: "भाषा",
    brandServer: "ZoNa Nakama डिस्कॉर्ड सर्वर",
    brandAwards: "ZN कंटेंट क्रिएटर अवॉर्ड्स",
    heroTitle: "ZN कंटेंट क्रिएटर्स",
    heroCta: "अभी सुझाएँ",
    currentVoteCount: "मौजूदा वोट गिनती",
    proposedCreators: "सुझाए गए क्रिएटर्स:",
    introTitle: "आपका पसंदीदा<br />ZoNami क्रिएटर कौन है?",
    introBody: '<a href="https://discord.gg/8rcrtwQWV7" target="_blank" rel="noreferrer noopener">ZoNa Nakama डिस्कॉर्ड सर्वर</a> उन क्रिएटर्स का जश्न मनाने के लिए है जो Zoro x Nami fandom को जीवंत, रचनात्मक और मजेदार बनाए रखते हैं।',
    phaseDescription: "अपने पसंदीदा क्रिएटर को सुझाएँ ताकि हम उन्हें कम्युनिटी सेलिब्रेशन में स्पॉटलाइट दे सकें।",
    joinEvent: "इवेंट में शामिल हों",
    suggestionPeriod: "सुझाव चरण",
    creatorName: "क्रिएटर का नाम",
    creatorNamePlaceholder: "ZoNamiLover",
    category: "श्रेणी",
    categoryPlaceholder: "एक श्रेणी चुनें",
    link: "लिंक",
    linkPlaceholder: "https://example.com/profile",
    reason: "इन्हें क्यों शामिल किया जाना चाहिए?",
    reasonPlaceholder: "बताइए कि यह क्रिएटर ZoNami फैंस के लिए क्यों खास है।",
    submitSuggestion: "सुझाव भेजें",
    submitting: "भेजा जा रहा है",
    sendingSuggestion: "आपका सुझाव भेजा जा रहा है...",
    loadingBody: "कृपया प्रतीक्षा करें, हम इसे मॉड्स की समीक्षा के लिए सहेज रहे हैं।",
    suggestionReceived: "सुझाव प्राप्त हुआ",
    successBody: "मॉड्स आपके सुझाव की समीक्षा करेंगे।",
    suggestAgain: "फिर से सुझाव दें",
    creatorRanking: "क्रिएटर स्पॉटलाइट",
    suggestedCreators: "फीचर्ड क्रिएटर्स",
    slideshow: "रैंडम",
    artists: "इलस्ट्रेटर्स",
    influencers: "इन्फ्लुएंसर्स",
    writers: "राइटर्स",
    rules: "नियम",
    rulesTitle: "भागीदारी कैसे काम करती है",
    eventHighlights: "इवेंट हाइलाइट्स",
    rewardsTitle: "आगे क्या होगा",
    discordKicker: "क्रू में शामिल हों",
    discordTitle: "सभी ZoNa shippers को बुलावा!",
    discordBody: "हमारे Discord पर आएँ और Zoro x Nami से जुड़ी हर चीज़ के साथ हमारे साथ सफर करें।",
    discordCta: "सर्वर जॉइन करें",
    suggestionStage: "सुझाव चरण",
    suggestionStageBody: "वोटिंग शुरू होने से पहले फैंस क्रिएटर्स को सुझाकर बैलेट तैयार कर सकते हैं।",
    dailyVoting: "दैनिक वोटिंग",
    dailyVotingBody: "जब वोटिंग खुलेगी, फैंस हर दिन वापस आकर अपने पसंदीदा क्रिएटर्स को सपोर्ट कर सकेंगे।",
    rankingReveal: "अंतिम परिणाम",
    rankingRevealBody: "अंतिम परिणाम साझा किए जाएँगे, और विजेताओं की घोषणा और जश्न समुदाय द्वारा मनाया जाएगा।",
    fillFields: "सुझाव भेजने से पहले सभी फ़ील्ड भरें।",
    withoutAt: 'क्रिएटर का नाम "@" के बिना लिखें।',
    sending: "भेजा जा रहा है...",
    submitError: "सुझाव भेजा नहीं जा सका।",
    noCreators: "कोई क्रिएटर नहीं मिला।",
    thankYou: "{name} को सुझाव देने के लिए धन्यवाद!",
    rule1: '<span class="rule-phase">सबमिशन चरण</span><br /><br />फैंस अपने पसंदीदा क्रिएटर्स को तीन श्रेणियों में सुझा सकते हैं, और हर सुझाव के साथ ऐसा लिंक होना चाहिए जो चुनी गई श्रेणी के मुताबिक उनके काम को दिखाए।<br /><br /><span class="rule-detail"><strong>इलस्ट्रेटर्स</strong>: फैनआर्ट, इलस्ट्रेशन और ड्रॉइंग्स.</span><br /><span class="rule-detail"><strong>राइटर्स</strong>: फैनफिक और अन्य लिखित ZoNami काम.</span><br /><span class="rule-detail"><strong>इन्फ्लुएंसर्स</strong>: वे फैंस जो सोशल मीडिया पर ZoNami को सक्रिय रूप से साझा और सपोर्ट करते हैं.</span><br /><br />आप Twitter, TikTok, Instagram, Tumblr, AO3 और अन्य प्लेटफ़ॉर्म्स से क्रिएटर्स सुझा सकते हैं।',
    rule2: '<span class="rule-phase">रिव्यू चरण</span><br /><br />मॉड्स हर सुझाव की समीक्षा करेंगे, डुप्लिकेट जाँचेंगे, और उन क्रिएटर्स को मंज़ूरी देंगे जो Creator Spotlight में दिखने चाहिए।',
    rule3: '<span class="rule-phase">वोटिंग चरण</span><br /><br />जब वोटिंग खुलेगी, हर कोई हर श्रेणी में अपने एक पसंदीदा क्रिएटर को दिन में एक बार वोट दे सकेगा।',
    rule4: '<span class="rule-phase">विजेताओं की घोषणा</span><br /><br />जब पोल बंद होगा, विजेताओं की घोषणा की जाएगी ताकि पूरा fandom साथ मिलकर जश्न मना सके।',
    profileLink: "लिंक",
    categories: { Illustrator: "इलस्ट्रेटर", Influencers: "इन्फ्लुएंसर", Writers: "राइटर" }
  },
  it: {
    languageLabel: "Lingua",
    brandServer: "Server Discord ZoNa Nakama",
    brandAwards: "PREMI ZN CONTENT CREATORS",
    heroTitle: "CREATORI DI CONTENUTI ZN",
    heroCta: "Suggerisci ora",
    currentVoteCount: "Conteggio attuale dei voti",
    proposedCreators: "Creator suggeriti:",
    introTitle: "Chi è il tuo<br />creator ZoNami preferito?",
    introBody: 'Il <a href="https://discord.gg/8rcrtwQWV7" target="_blank" rel="noreferrer noopener">server Discord ZoNa Nakama</a> è qui per celebrare i creator che mantengono il fandom Zoro x Nami attivo, creativo e divertente.',
    phaseDescription: "Suggerisci il tuo creator preferito così potremo metterlo in evidenza nella celebrazione della community.",
    joinEvent: "Partecipa all’evento",
    suggestionPeriod: "Periodo dei suggerimenti",
    creatorName: "Nome del creator",
    creatorNamePlaceholder: "ZoNamiLover",
    category: "Categoria",
    categoryPlaceholder: "Seleziona una categoria",
    link: "Link",
    linkPlaceholder: "https://example.com/profile",
    reason: "Perché dovrebbe essere incluso?",
    reasonPlaceholder: "Spiega cosa rende questo creator speciale per i fan di ZoNami.",
    submitSuggestion: "Invia suggerimento",
    submitting: "Invio in corso",
    sendingSuggestion: "Stiamo inviando il tuo suggerimento...",
    loadingBody: "Attendi mentre lo salviamo per la revisione dei moderatori.",
    suggestionReceived: "Suggerimento ricevuto",
    successBody: "I moderatori esamineranno il tuo suggerimento.",
    suggestAgain: "Suggerisci di nuovo",
    creatorRanking: "Spotlight creator",
    suggestedCreators: "Creator in evidenza",
    slideshow: "Casuale",
    artists: "Illustratori",
    influencers: "Influencer",
    writers: "Scrittori",
    rules: "Regole",
    rulesTitle: "Come funziona la partecipazione",
    eventHighlights: "Momenti salienti",
    rewardsTitle: "Cosa succede dopo",
    discordKicker: "Unisciti all’equipaggio",
    discordTitle: "Chiamata a tutti gli shippers ZoNa!",
    discordBody: "Sali a bordo del nostro Discord e naviga con noi tra tutte le cose dedicate a Zoro x Nami.",
    discordCta: "Entra nel server",
    suggestionStage: "Fase di suggerimento",
    suggestionStageBody: "I fan possono costruire la scheda proponendo creator prima che si apra la votazione.",
    dailyVoting: "Voto giornaliero",
    dailyVotingBody: "Quando la votazione si aprirà, i fan potranno tornare ogni giorno per sostenere i loro preferiti.",
    rankingReveal: "Risultati finali",
    rankingRevealBody: "I risultati finali saranno condivisi e i vincitori saranno annunciati e celebrati dalla community.",
    fillFields: "Compila tutti i campi prima di inviare un suggerimento.",
    withoutAt: 'Inserisci il nome del creator senza "@".',
    sending: "Invio in corso...",
    submitError: "Impossibile inviare il suggerimento.",
    noCreators: "Nessun creator trovato.",
    thankYou: "Grazie per aver suggerito {name}!",
    rule1: '<span class="rule-phase">Fase di invio</span><br /><br />I fan possono proporre i loro creator preferiti in tre categorie, e ogni proposta deve includere un link che mostri il lavoro adatto alla categoria scelta.<br /><br /><span class="rule-detail"><strong>Illustratori</strong>: fanart, illustrazioni e disegni.</span><br /><span class="rule-detail"><strong>Scrittori</strong>: fanfiction e altri lavori scritti ZoNami.</span><br /><span class="rule-detail"><strong>Influencer</strong>: fan che condividono e supportano attivamente ZoNami sui social.</span><br /><br />Puoi suggerire creator da Twitter, TikTok, Instagram, Tumblr, AO3 e altre piattaforme.',
    rule2: '<span class="rule-phase">Fase di revisione</span><br /><br />I moderatori esaminano ogni proposta, controllano i duplicati e approvano i creator che dovrebbero apparire nel Creator Spotlight.',
    rule3: '<span class="rule-phase">Fase di voto</span><br /><br />Quando la votazione si aprirà, tutti potranno votare una volta al giorno per un creator preferito in ogni categoria.',
    rule4: '<span class="rule-phase">Annuncio dei vincitori</span><br /><br />Quando il sondaggio si chiuderà, i vincitori saranno annunciati così tutto il fandom potrà festeggiare insieme.',
    profileLink: "Link",
    categories: { Illustrator: "Illustratore", Influencers: "Influencer", Writers: "Scrittori" }
  },
  id: {
    languageLabel: "Bahasa",
    brandServer: "Server Discord ZoNa Nakama",
    brandAwards: "PENGHARGAAN ZN CONTENT CREATORS",
    heroTitle: "KREATOR KONTEN ZN",
    heroCta: "Ajukan sekarang",
    currentVoteCount: "Jumlah suara saat ini",
    proposedCreators: "Kreator yang diajukan:",
    introTitle: "Siapa<br />kreator ZoNami favoritmu?",
    introBody: '<a href="https://discord.gg/8rcrtwQWV7" target="_blank" rel="noreferrer noopener">Server Discord ZoNa Nakama</a> hadir untuk merayakan para kreator yang membuat fandom Zoro x Nami tetap hidup, kreatif, dan seru.',
    phaseDescription: "Ajukan kreator favoritmu agar kami bisa menyorot mereka dalam perayaan komunitas ini.",
    joinEvent: "Ikut acara",
    suggestionPeriod: "Masa pengajuan",
    creatorName: "Nama kreator",
    creatorNamePlaceholder: "ZoNamiLover",
    category: "Kategori",
    categoryPlaceholder: "Pilih kategori",
    link: "Tautan",
    linkPlaceholder: "https://example.com/profile",
    reason: "Kenapa mereka harus dimasukkan?",
    reasonPlaceholder: "Jelaskan apa yang membuat kreator ini spesial bagi fans ZoNami.",
    submitSuggestion: "Kirim pengajuan",
    submitting: "Mengirim",
    sendingSuggestion: "Sedang mengirim pengajuanmu...",
    loadingBody: "Tunggu sebentar, kami sedang menyimpannya untuk ditinjau para mod.",
    suggestionReceived: "Pengajuan diterima",
    successBody: "Para mod akan meninjau pengajuanmu.",
    suggestAgain: "Ajukan lagi",
    creatorRanking: "Sorotan kreator",
    suggestedCreators: "Kreator unggulan",
    slideshow: "Acak",
    artists: "Ilustrator",
    influencers: "Influencer",
    writers: "Penulis",
    rules: "Aturan",
    rulesTitle: "Cara berpartisipasi",
    eventHighlights: "Sorotan acara",
    rewardsTitle: "Apa yang terjadi selanjutnya",
    discordKicker: "Gabung kru",
    discordTitle: "Memanggil semua shipper ZoNa!",
    discordBody: "Naik ke Discord kami dan berlayarlah bersama kami untuk semua hal tentang Zoro x Nami.",
    discordCta: "Gabung server",
    suggestionStage: "Tahap pengajuan",
    suggestionStageBody: "Fans bisa membangun daftar kandidat dengan mengajukan kreator sebelum voting dibuka.",
    dailyVoting: "Voting harian",
    dailyVotingBody: "Saat voting dibuka, fans bisa kembali setiap hari untuk mendukung favorit mereka.",
    rankingReveal: "Hasil akhir",
    rankingRevealBody: "Hasil akhir akan dibagikan, dan para pemenang akan diumumkan serta dirayakan oleh komunitas.",
    fillFields: "Isi semua kolom sebelum mengirim pengajuan.",
    withoutAt: 'Masukkan nama kreator tanpa "@".',
    sending: "Mengirim...",
    submitError: "Pengajuan tidak dapat dikirim.",
    noCreators: "Tidak ada kreator yang ditemukan.",
    thankYou: "Terima kasih sudah mengajukan {name}!",
    rule1: '<span class="rule-phase">Fase pengajuan</span><br /><br />Fans bisa mengajukan kreator favorit mereka dalam tiga kategori, dan setiap pengajuan harus menyertakan tautan yang menunjukkan karya yang sesuai dengan kategori tersebut.<br /><br /><span class="rule-detail"><strong>Ilustrator</strong>: fanart, ilustrasi, dan gambar.</span><br /><span class="rule-detail"><strong>Penulis</strong>: fanfic dan karya tulis ZoNami lainnya.</span><br /><span class="rule-detail"><strong>Influencer</strong>: fans yang aktif membagikan dan mendukung ZoNami di media sosial.</span><br /><br />Kamu bisa mengajukan kreator dari Twitter, TikTok, Instagram, Tumblr, AO3, dan platform lainnya.',
    rule2: '<span class="rule-phase">Fase peninjauan</span><br /><br />Para mod meninjau setiap pengajuan, memeriksa duplikat, dan menyetujui kreator yang harus tampil di Creator Spotlight.',
    rule3: '<span class="rule-phase">Fase voting</span><br /><br />Saat voting dibuka, semua orang bisa memilih satu kreator favorit per kategori sekali sehari.',
    rule4: '<span class="rule-phase">Pengumuman pemenang</span><br /><br />Saat polling ditutup, para pemenang akan diumumkan agar seluruh fandom bisa merayakannya bersama.',
    profileLink: "Tautan",
    categories: { Illustrator: "Ilustrator", Influencers: "Influencer", Writers: "Penulis" }
  },
  ar: {
    languageLabel: "اللغة",
    brandServer: "خادم ديسكورد ZoNa Nakama",
    brandAwards: "جوائز صناع محتوى ZN",
    heroTitle: "صناع محتوى ZN",
    heroCta: "رشّح الآن",
    currentVoteCount: "عدد الأصوات الحالي",
    proposedCreators: "المبدعون المقترحون:",
    introTitle: "من هو<br />صانع محتوى ZoNami المفضل لديك؟",
    introBody: 'خادم <a href="https://discord.gg/8rcrtwQWV7" target="_blank" rel="noreferrer noopener">ZoNa Nakama على ديسكورد</a> هنا للاحتفال بالمبدعين الذين يبقون فاندوم Zoro x Nami حيًا ومبدعًا وممتعًا.',
    phaseDescription: "رشّح صانع المحتوى المفضل لديك حتى نسلط عليه الضوء في احتفال المجتمع.",
    joinEvent: "انضم إلى الحدث",
    suggestionPeriod: "مرحلة الترشيحات",
    creatorName: "اسم صانع المحتوى",
    creatorNamePlaceholder: "ZoNamiLover",
    category: "الفئة",
    categoryPlaceholder: "اختر فئة",
    link: "الرابط",
    linkPlaceholder: "https://example.com/profile",
    reason: "لماذا يجب أن يتم اختياره؟",
    reasonPlaceholder: "اشرح ما الذي يجعل هذا المبدع مميزًا بالنسبة إلى جمهور ZoNami.",
    submitSuggestion: "إرسال الترشيح",
    submitting: "جارٍ الإرسال",
    sendingSuggestion: "جارٍ إرسال ترشيحك...",
    loadingBody: "يرجى الانتظار بينما نحفظه لكي يراجعه المشرفون.",
    suggestionReceived: "تم استلام الترشيح",
    successBody: "سيقوم المشرفون بمراجعة ترشيحك.",
    suggestAgain: "رشّح مرة أخرى",
    creatorRanking: "واجهة المبدعين",
    suggestedCreators: "المبدعون المميزون",
    slideshow: "عشوائي",
    artists: "الرسامون",
    influencers: "المؤثرون",
    writers: "الكتّاب",
    rules: "القواعد",
    rulesTitle: "كيف تعمل المشاركة",
    eventHighlights: "أبرز ما في الحدث",
    rewardsTitle: "ماذا يحدث بعد ذلك",
    discordKicker: "انضم إلى الطاقم",
    discordTitle: "نداء إلى جميع محبي ZoNa!",
    discordBody: "اصعد إلى ديسكورد الخاص بنا وأبحر معنا في كل ما يتعلق بـ Zoro x Nami.",
    discordCta: "انضم إلى الخادم",
    suggestionStage: "مرحلة الترشيح",
    suggestionStageBody: "يمكن للجمهور بناء القائمة عبر ترشيح المبدعين قبل فتح التصويت.",
    dailyVoting: "التصويت اليومي",
    dailyVotingBody: "عندما يبدأ التصويت، يمكن للمعجبين العودة كل يوم لدعم مفضليهم.",
    rankingReveal: "النتائج النهائية",
    rankingRevealBody: "ستتم مشاركة النتائج النهائية، وسيتم إعلان الفائزين والاحتفال بهم من قبل المجتمع.",
    fillFields: "املأ جميع الحقول قبل إرسال الترشيح.",
    withoutAt: 'أدخل اسم صانع المحتوى من دون "@".',
    sending: "جارٍ الإرسال...",
    submitError: "تعذر إرسال الترشيح.",
    noCreators: "لم يتم العثور على أي مبدعين.",
    thankYou: "شكرًا لترشيحك {name}!",
    rule1: '<span class="rule-phase">مرحلة الترشيح</span><br /><br />يمكن للجمهور ترشيح صناع المحتوى المفضلين لديهم ضمن ثلاث فئات، ويجب أن يتضمن كل ترشيح رابطًا يُظهر العمل المناسب للفئة المختارة.<br /><br /><span class="rule-detail"><strong>الرسامون</strong>: فن المعجبين والرسومات واللوحات.</span><br /><span class="rule-detail"><strong>الكتّاب</strong>: الفانفيك وغيرها من الأعمال الكتابية الخاصة بـ ZoNami.</span><br /><span class="rule-detail"><strong>المؤثرون</strong>: المعجبون الذين يشاركون ويدعمون ZoNami بنشاط عبر وسائل التواصل الاجتماعي.</span><br /><br />يمكنك ترشيح مبدعين من Twitter وTikTok وInstagram وTumblr وAO3 ومنصات أخرى.',
    rule2: '<span class="rule-phase">مرحلة المراجعة</span><br /><br />يراجع المشرفون كل ترشيح، ويتحققون من التكرار، ويعتمدون المبدعين الذين يجب أن يظهروا في Creator Spotlight.',
    rule3: '<span class="rule-phase">مرحلة التصويت</span><br /><br />عندما يبدأ التصويت، سيتمكن الجميع من التصويت مرة واحدة يوميًا لصانع محتوى مفضل واحد في كل فئة.',
    rule4: '<span class="rule-phase">إعلان الفائزين</span><br /><br />عند إغلاق التصويت، سيتم إعلان الفائزين ليحتفل بهم الفاندوم كله معًا.',
    profileLink: "الرابط",
    categories: { Illustrator: "رسام", Influencers: "مؤثر", Writers: "كاتب" }
  }
};

for (const code of LANGUAGE_CODES) {
  if (!translations[code]) {
    translations[code] = { ...translations.en, categories: { ...translations.en.categories } };
  }
}

const creatorCounter = document.getElementById("creatorCounter");
const phaseTitle = document.getElementById("phaseTitle");
const phaseDescription = document.getElementById("phaseDescription");
const actionLabel = document.querySelector("[data-action-label]");
const participateTitle = document.getElementById("participateTitle");
const feedbackMessage = document.getElementById("feedbackMessage");
const creatorGrid = document.getElementById("creatorGrid");
const creatorTemplate = document.getElementById("creatorCardTemplate");
const suggestionForm = document.getElementById("suggestionForm");
const creatorNameInput = suggestionForm.elements.namedItem("name");
const loadingPanel = document.getElementById("loadingPanel");
const successPanel = document.getElementById("successPanel");
const successTitle = document.getElementById("successTitle");
const suggestAgainButton = document.getElementById("suggestAgainButton");
const ruleList = document.getElementById("ruleList");
const creatorFilters = Array.from(document.querySelectorAll(".creator-filter"));
const creatorPagination = document.getElementById("creatorPagination");
const creatorPrevButton = document.getElementById("creatorPrevButton");
const creatorNextButton = document.getElementById("creatorNextButton");
const creatorPageStatus = document.getElementById("creatorPageStatus");
const creatorSearchToggle = document.getElementById("creatorSearchToggle");
const creatorSearchPanel = document.getElementById("creatorSearchPanel");
const creatorSearchInput = document.getElementById("creatorSearchInput");
const languageSelect = document.getElementById("languageSelect");

let state = loadState();
let currentLanguage = detectLanguage();
let showcaseSelection = [];
let showcaseTimerStarted = false;
let activeCreatorFilter = "slideshow";
let creatorPage = 0;
let creatorSearchQuery = "";
const CREATORS_PER_PAGE = 5;
const RANDOM_CREATORS_PER_VIEW = 3;

const i18nKeyMap = {
  "brand.server": "brandServer",
  "brand.awards": "brandAwards",
  "lang.label": "languageLabel",
  "hero.title": "heroTitle",
  "hero.cta": "heroCta",
  "hero.vote_count": "currentVoteCount",
  "hero.proposed_creators": "proposedCreators",
  "intro.title": "introTitle",
  "intro.body": "introBody",
  "intro.phase_description": "phaseDescription",
  "participate.kicker": "joinEvent",
  "participate.title": "suggestionPeriod",
  "form.creator_name": "creatorName",
  "form.creator_name_placeholder": "creatorNamePlaceholder",
  "form.category": "category",
  "form.category_placeholder": "categoryPlaceholder",
  "form.link": "link",
  "form.link_placeholder": "linkPlaceholder",
  "form.reason": "reason",
  "form.reason_placeholder": "reasonPlaceholder",
  "form.submit": "submitSuggestion",
  "loading.kicker": "submitting",
  "loading.title": "sendingSuggestion",
  "loading.body": "loadingBody",
  "success.kicker": "suggestionReceived",
  "success.body": "successBody",
  "success.cta": "suggestAgain",
  "creators.kicker": "creatorRanking",
  "creators.title": "suggestedCreators",
  "filters.slideshow": "slideshow",
  "filters.artists": "artists",
  "filters.influencers": "influencers",
  "filters.writers": "writers",
  "rules.kicker": "rules",
  "rules.title": "rulesTitle",
    "rewards.kicker": "eventHighlights",
    "rewards.title": "rewardsTitle",
    "rewards.stage_title": "suggestionStage",
    "rewards.stage_body": "suggestionStageBody",
    "rewards.daily_title": "dailyVoting",
    "rewards.daily_body": "dailyVotingBody",
    "rewards.reveal_title": "rankingReveal",
    "rewards.reveal_body": "rankingRevealBody",
    "discord.kicker": "discordKicker",
    "discord.title": "discordTitle",
    "discord.body": "discordBody",
    "discord.cta": "discordCta",
  };
function detectLanguage() {
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (stored && LANGUAGE_CODES.includes(stored)) return stored;
  const browserLanguages = [navigator.language, ...(navigator.languages || [])].filter(Boolean).map((item) => item.toLowerCase());
  for (const lang of browserLanguages) {
    const base = lang.split("-")[0];
    if (LANGUAGE_CODES.includes(lang)) return lang;
    if (LANGUAGE_CODES.includes(base)) return base;
  }
  return "en";
}

function t(key, params = {}) {
  const table = translations[currentLanguage] || translations.en;
  const resolvedKey = i18nKeyMap[key] || key;
  if (resolvedKey.startsWith("category.")) {
    return categoryLabel(resolvedKey.slice("category.".length));
  }
  let value = table[resolvedKey] ?? translations.en[resolvedKey] ?? key;
  for (const [param, replacement] of Object.entries(params)) {
    value = value.replace(`{${param}}`, replacement);
  }
  return value;
}

function categoryLabel(value) {
  return (translations[currentLanguage] || translations.en).categories[value] || value;
}

function getBrowserToken() {
  const tokenKey = `${STORAGE_KEY}-browser-token`;
  const existing = localStorage.getItem(tokenKey);
  if (existing) return existing;
  const created = crypto.randomUUID();
  localStorage.setItem(tokenKey, created);
  return created;
}

function buildSubmissionMetadata() {
  return {
    browser_token: getBrowserToken(),
    user_agent: navigator.userAgent,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen: `${window.screen.width}x${window.screen.height}`,
    referrer: document.referrer,
    submitted_at_client: new Date().toISOString(),
  };
}

function normalizeCategory(value) {
  if (["Illustrator", "Influencers", "Writers"].includes(value)) return value;
  return "Influencers";
}

function normalizeLink(value, name = "creator") {
  if (typeof value === "string" && /^https?:\/\//i.test(value.trim())) return value.trim();
  const slug = String(name || "creator").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return `https://zonami.example/${slug || "creator"}`;
}

function normalizeCreatorEntry(entry) {
  return { ...entry, platform: normalizeCategory(entry.platform), region: normalizeLink(entry.region, entry.name) };
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { creators: seedCreators.map(normalizeCreatorEntry), submissions: [] };
  try {
    const parsed = JSON.parse(raw);
    return {
      creators: Array.isArray(parsed.creators) && parsed.creators.length ? parsed.creators.map(normalizeCreatorEntry) : seedCreators.map(normalizeCreatorEntry),
      submissions: Array.isArray(parsed.submissions) ? parsed.submissions.map(normalizeCreatorEntry) : [],
    };
  } catch {
    return { creators: seedCreators.map(normalizeCreatorEntry), submissions: [] };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function setFeedback(message, type = "") {
  feedbackMessage.textContent = message;
  feedbackMessage.className = "feedback";
  if (type) feedbackMessage.classList.add(`is-${type}`);
}

function showSuggestionSuccess(name) {
  loadingPanel.classList.add("is-hidden");
  suggestionForm.classList.add("is-hidden");
  successPanel.classList.remove("is-hidden");
  successPanel.dataset.creatorName = name;
  successTitle.textContent = t("thankYou", { name });
}

function showSuggestionForm() {
  loadingPanel.classList.add("is-hidden");
  successPanel.classList.add("is-hidden");
  delete successPanel.dataset.creatorName;
  suggestionForm.classList.remove("is-hidden");
}

function showSuggestionLoading() {
  successPanel.classList.add("is-hidden");
  suggestionForm.classList.add("is-hidden");
  loadingPanel.classList.remove("is-hidden");
}

function validateCreatorNameField() {
  if (!creatorNameInput) return true;
  const value = creatorNameInput.value.trim();
  if (value.startsWith("@")) {
    creatorNameInput.setCustomValidity(t("withoutAt"));
    creatorNameInput.reportValidity();
    return false;
  }
  creatorNameInput.setCustomValidity("");
  return true;
}

function getAllCreators() {
  return [...state.creators, ...state.submissions];
}

function sortedCreators() {
  return getAllCreators().sort((left, right) => left.name.localeCompare(right.name));
}

function pickRandomCreators(creators, count) {
  const shuffled = [...creators];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled.slice(0, count);
}

function refreshShowcaseSelection() {
  const creators = sortedCreators();
  showcaseSelection = pickRandomCreators(creators, Math.min(RANDOM_CREATORS_PER_VIEW, creators.length));
}

function showcasedCreators() {
  const creators = sortedCreators();
  if (creators.length <= RANDOM_CREATORS_PER_VIEW) return creators;
  if (!showcaseSelection.length) refreshShowcaseSelection();
  return showcaseSelection;
}

function searchResults() {
  const query = creatorSearchQuery.trim().toLowerCase();
  if (!query) return [];
  return sortedCreators().filter((creator) =>
    [creator.name, creator.region, creator.pitch].some((value) =>
      String(value || "").toLowerCase().includes(query)
    )
  );
}

function visibleCreators() {
  let filtered;
  if (creatorSearchQuery.trim()) {
    filtered = searchResults();
  } else {
    const creators = sortedCreators();
    if (activeCreatorFilter === "slideshow") return showcasedCreators();
    filtered = creators.filter((creator) => creator.platform === activeCreatorFilter);
  }
  const start = creatorPage * CREATORS_PER_PAGE;
  return filtered.slice(start, start + CREATORS_PER_PAGE);
}

function filteredCreatorsCount() {
  if (creatorSearchQuery.trim()) return searchResults().length;
  if (activeCreatorFilter === "slideshow") return sortedCreators().length;
  return sortedCreators().filter((creator) => creator.platform === activeCreatorFilter).length;
}

function renderCreatorPagination() {
  if (!creatorPagination || !creatorPrevButton || !creatorNextButton || !creatorPageStatus) return;
  if (activeCreatorFilter === "slideshow" && !creatorSearchQuery.trim()) {
    creatorPagination.classList.add("is-inactive");
    return;
  }

  const total = filteredCreatorsCount();
  const totalPages = Math.max(1, Math.ceil(total / CREATORS_PER_PAGE));

  if (creatorPage > totalPages - 1) creatorPage = totalPages - 1;

  creatorPagination.classList.toggle("is-inactive", total <= CREATORS_PER_PAGE);
  creatorPageStatus.textContent = `${creatorPage + 1} / ${totalPages}`;
  creatorPrevButton.disabled = creatorPage === 0;
  creatorNextButton.disabled = creatorPage >= totalPages - 1;
}

function renderCreators() {
  creatorGrid.innerHTML = "";
  const creators = visibleCreators();
  creators.forEach((creator) => {
    const fragment = creatorTemplate.content.cloneNode(true);
    fragment.querySelector(".creator-name").textContent = creator.name;
    fragment.querySelector(".creator-category").textContent = categoryLabel(creator.platform);
    const anchor = document.createElement("a");
    anchor.href = creator.region;
    anchor.target = "_blank";
    anchor.rel = "noreferrer noopener";
    anchor.textContent = creator.region;
    fragment.querySelector(".creator-link").replaceChildren(anchor);
    fragment.querySelector(".creator-pitch").textContent = creator.pitch;
    creatorGrid.appendChild(fragment);
  });
  if (!creators.length) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "creator-card";
    emptyItem.textContent = t("noCreators");
    creatorGrid.appendChild(emptyItem);
  }
  renderCreatorPagination();
}

function renderCounters() {
  creatorCounter.textContent = String(getAllCreators().length).padStart(2, "0");
}
function applyTranslations() {
  document.documentElement.lang = currentLanguage;
  document.documentElement.dir = RTL_LANGUAGES.has(currentLanguage) ? "rtl" : "ltr";
  if (languageSelect) languageSelect.value = currentLanguage;
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-html]").forEach((node) => {
    node.innerHTML = t(node.dataset.i18nHtml);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    node.setAttribute("placeholder", t(node.dataset.i18nPlaceholder));
  });
  phaseTitle.textContent = t("suggestionPeriod");
  phaseDescription.textContent = t("phaseDescription");
  actionLabel.textContent = t("heroCta");
  participateTitle.textContent = t("suggestedCreators");
  ruleList.innerHTML = "";
  ["rule1", "rule2", "rule3", "rule4"].forEach((key) => {
    const item = document.createElement("li");
    item.innerHTML = t(key);
    ruleList.appendChild(item);
  });
  if (!successPanel.classList.contains("is-hidden")) {
    successTitle.textContent = t("thankYou", { name: successPanel.dataset.creatorName || t("creatorNamePlaceholder") });
  }
  renderCreators();
}

function setLanguage(nextLanguage) {
  currentLanguage = LANGUAGE_CODES.includes(nextLanguage) ? nextLanguage : "en";
  localStorage.setItem(LANGUAGE_STORAGE_KEY, currentLanguage);
  applyTranslations();
}

async function submitSuggestionToBackend(payload) {
  if (!SUBMISSION_ENDPOINT) return { ok: true, mode: "local-only" };
  const formData = new URLSearchParams();
  formData.set("creator_name", payload.creator_name);
  formData.set("category", payload.category);
  formData.set("link", payload.link);
  formData.set("reason", payload.reason);
  formData.set("metadata_json", JSON.stringify(payload.metadata));
  const response = await fetch(SUBMISSION_ENDPOINT, { method: "POST", body: formData });
  const result = await response.json();
  if (!response.ok || !result.ok) throw new Error(result.message || t("submitError"));
  return result;
}

async function loadApprovedCreatorsFromBackend() {
  if (!APPROVED_ENDPOINT) return [];
  const response = await fetch(APPROVED_ENDPOINT);
  const result = await response.json();
  if (!response.ok || !result.ok || !Array.isArray(result.creators)) throw new Error(result.message || "Could not load approved creators.");
  return result.creators.map((creator) => ({ id: creator.submission_id || crypto.randomUUID(), name: creator.creator_name, platform: normalizeCategory(creator.category), region: normalizeLink(creator.link, creator.creator_name), pitch: creator.reason }));
}

async function hydrateApprovedCreators() {
  if (!APPROVED_ENDPOINT) return;
  try {
    state.creators = await loadApprovedCreatorsFromBackend();
    state.submissions = [];
    refreshShowcaseSelection();
    saveState();
    renderCounters();
    renderCreators();
  } catch {}
}

function startShowcaseRotation() {
  if (showcaseTimerStarted) return;
  showcaseTimerStarted = true;
    window.setInterval(() => {
      if (activeCreatorFilter !== "slideshow") return;
      const creators = sortedCreators();
      if (creators.length <= RANDOM_CREATORS_PER_VIEW) return;
      refreshShowcaseSelection();
      renderCreators();
    }, 10000);
  }

suggestionForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(suggestionForm);
  const name = String(formData.get("name") ?? "").trim();
  const platform = String(formData.get("platform") ?? "").trim();
  const region = String(formData.get("region") ?? "").trim();
  const pitch = String(formData.get("pitch") ?? "").trim();
  if (!name || !platform || !region || !pitch) {
    setFeedback(t("fillFields"), "error");
    return;
  }
  if (!validateCreatorNameField()) return;
  if (name.includes("@")) {
    setFeedback(t("withoutAt"), "error");
    return;
  }
  const submitButton = suggestionForm.querySelector('button[type="submit"]');
  const originalButtonText = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = t("sending");
  showSuggestionLoading();
  try {
    await submitSuggestionToBackend({ creator_name: name, category: platform, link: region, reason: pitch, metadata: buildSubmissionMetadata() });
    state.submissions.unshift(normalizeCreatorEntry({ id: crypto.randomUUID(), name, platform, region, pitch }));
    suggestionForm.reset();
    refreshShowcaseSelection();
    saveState();
    setFeedback("", "");
    renderCounters();
    renderCreators();
    showSuggestionSuccess(name);
  } catch (error) {
    showSuggestionForm();
    setFeedback(error.message || t("submitError"), "error");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
  }
});

creatorNameInput?.addEventListener("input", () => {
  validateCreatorNameField();
});

suggestAgainButton?.addEventListener("click", () => {
  showSuggestionForm();
  setFeedback("", "");
  creatorNameInput?.focus();
});

creatorFilters.forEach((button) => {
  button.addEventListener("click", () => {
    activeCreatorFilter = button.dataset.filter;
    creatorSearchQuery = "";
    if (creatorSearchInput) creatorSearchInput.value = "";
    creatorSearchPanel?.classList.add("is-hidden");
    creatorSearchToggle?.classList.remove("is-active");
    creatorPage = 0;
    if (activeCreatorFilter === "slideshow") refreshShowcaseSelection();
    creatorFilters.forEach((item) => item.classList.toggle("is-active", item === button));
    renderCreators();
  });
});

creatorSearchToggle?.addEventListener("click", () => {
  const isOpen = !creatorSearchPanel.classList.contains("is-hidden");
  if (!isOpen) {
    creatorSearchPanel.classList.remove("is-hidden");
    creatorSearchToggle.classList.add("is-active");
    creatorSearchInput?.focus();
    return;
  }

  creatorSearchPanel.classList.add("is-hidden");
  creatorSearchToggle.classList.remove("is-active");
  creatorSearchQuery = "";
  if (creatorSearchInput) creatorSearchInput.value = "";
  activeCreatorFilter = "slideshow";
  creatorFilters.forEach((item) => item.classList.toggle("is-active", item.dataset.filter === "slideshow"));
  refreshShowcaseSelection();
  creatorPage = 0;
  renderCreators();
});

creatorSearchInput?.addEventListener("input", (event) => {
  creatorSearchQuery = event.target.value || "";
  creatorPage = 0;
  creatorSearchToggle?.classList.toggle("is-active", Boolean(creatorSearchQuery.trim()));
  renderCreators();
});

creatorPrevButton?.addEventListener("click", () => {
  if (creatorPage === 0) return;
  creatorPage -= 1;
  renderCreators();
});

creatorNextButton?.addEventListener("click", () => {
  const totalPages = Math.max(1, Math.ceil(filteredCreatorsCount() / CREATORS_PER_PAGE));
  if (creatorPage >= totalPages - 1) return;
  creatorPage += 1;
  renderCreators();
});

languageSelect?.addEventListener("change", (event) => {
  setLanguage(event.target.value);
});

renderCounters();
refreshShowcaseSelection();
applyTranslations();
startShowcaseRotation();
hydrateApprovedCreators();
