// ============================================================
// ONE TIMES GOOD ONE — Personality Quiz Questions & Scoring
// 60 questions across 4 frameworks: MBTI, Enneagram, DISC,
// and Big Five (OCEAN)
// ============================================================

const QUESTIONS = [
  // --- Q1-10: Social energy, leadership, emotional expression ---
  {
    id: 1,
    text: "I feel energised after spending time with a large group of people.",
    scoring: {
      "mbti_E": 2,
      "ocean_E": 2,
      "disc_I": 1,
      "enneagram_7": 1
    }
  },
  {
    id: 2,
    text: "I'd rather have one deep conversation than work a room full of people.",
    scoring: {
      "mbti_E": -2,
      "ocean_E": -1,
      "enneagram_4": 1
    }
  },
  {
    id: 3,
    text: "When there's a problem, I want to take charge and fix it immediately.",
    scoring: {
      "disc_D": 2,
      "enneagram_8": 1,
      "ocean_A": -1
    }
  },
  {
    id: 4,
    text: "I notice small details that other people tend to overlook.",
    scoring: {
      "mbti_N": -1,
      "ocean_C": 1,
      "disc_C": 1,
      "enneagram_1": 1,
      "mbti_J": 1
    }
  },
  {
    id: 5,
    text: "I often imagine how the world could be different from how it is now.",
    scoring: {
      "mbti_N": 2,
      "ocean_O": 2,
      "enneagram_1": 1,
      "enneagram_5": 1
    }
  },
  {
    id: 6,
    text: "A sincere compliment from someone I care about can make my whole week.",
    scoring: {
      "mbti_F": 1,
      "ocean_N": 1,
      "enneagram_2": 2,
      "ocean_A": 1
    }
  },
  {
    id: 7,
    text: "I make decisions based on logic, even if it means someone's feelings might get hurt.",
    scoring: {
      "mbti_F": -2,
      "ocean_A": -1,
      "disc_D": 1,
      "enneagram_5": 1
    }
  },
  {
    id: 8,
    text: "I like to keep my options open rather than commit to a firm plan.",
    scoring: {
      "mbti_J": -2,
      "ocean_C": -1,
      "enneagram_7": 1,
      "disc_S": -1
    }
  },
  {
    id: 9,
    text: "I learn best by thinking things through on my own rather than talking it out with others.",
    scoring: {
      "mbti_E": -1,
      "ocean_E": -1,
      "enneagram_5": 1,
      "disc_C": 1
    }
  },
  {
    id: 10,
    text: "I get stressed when things feel chaotic or unorganised.",
    scoring: {
      "mbti_J": 1,
      "ocean_C": 1,
      "disc_C": 1,
      "enneagram_1": 1
    }
  },

  // --- Q11-20: Thinking style, relationships, motivation ---
  {
    id: 11,
    text: "I trust my gut feeling more than a detailed analysis.",
    scoring: {
      "mbti_N": 1,
      "mbti_F": 1,
      "ocean_O": 1
    }
  },
  {
    id: 12,
    text: "I enjoy being the centre of attention at social events.",
    scoring: {
      "mbti_E": 2,
      "ocean_E": 2,
      "disc_I": 2,
      "enneagram_3": 1
    }
  },
  {
    id: 13,
    text: "When someone I care about is having a bad day, I want to do something practical to help — cook a meal, run an errand, fix the problem.",
    scoring: {
      "mbti_N": -1,
      "enneagram_2": 2,
      "disc_S": 1,
      "ocean_A": 1
    }
  },
  {
    id: 14,
    text: "I worry about things going wrong more than most people do.",
    scoring: {
      "ocean_N": 2,
      "enneagram_6": 2
    }
  },
  {
    id: 15,
    text: "I find it easy to motivate and persuade other people.",
    scoring: {
      "disc_I": 2,
      "mbti_E": 1,
      "ocean_E": 1,
      "enneagram_3": 1
    }
  },
  {
    id: 16,
    text: "I'd rather follow a tried-and-tested method than experiment with something new.",
    scoring: {
      "mbti_N": -2,
      "ocean_O": -2,
      "disc_S": 1,
      "enneagram_6": 1
    }
  },
  {
    id: 17,
    text: "I enjoy exploring abstract concepts and philosophical ideas.",
    scoring: {
      "ocean_O": 2,
      "mbti_N": 2,
      "enneagram_5": 1
    }
  },
  {
    id: 18,
    text: "I need time alone to recharge after being around people.",
    scoring: {
      "mbti_E": -2,
      "ocean_E": -1,
      "enneagram_5": 1,
      "disc_I": -1
    }
  },
  {
    id: 19,
    text: "I set ambitious goals and push hard to achieve them.",
    scoring: {
      "disc_D": 1,
      "ocean_C": 1,
      "enneagram_3": 2,
      "mbti_J": 1
    }
  },
  {
    id: 20,
    text: "I tend to express my emotions openly — people usually know how I feel.",
    scoring: {
      "ocean_E": 1,
      "mbti_E": 1,
      "mbti_F": 1,
      "enneagram_4": 1,
      "ocean_N": 1
    }
  },

  // --- Q21-30: Conflict, values, inner life ---
  {
    id: 21,
    text: "I avoid conflict whenever possible — I'd rather keep the peace.",
    scoring: {
      "ocean_A": 2,
      "disc_S": 2,
      "enneagram_9": 2,
      "disc_D": -1,
      "mbti_F": 1
    }
  },
  {
    id: 22,
    text: "I often think about the meaning and purpose behind everyday things.",
    scoring: {
      "mbti_N": 1,
      "ocean_O": 1,
      "enneagram_4": 1,
      "enneagram_5": 1
    }
  },
  {
    id: 23,
    text: "I like things done properly — if it's worth doing, it's worth doing right.",
    scoring: {
      "disc_C": 2,
      "ocean_C": 1,
      "enneagram_1": 2,
      "mbti_J": 1
    }
  },
  {
    id: 24,
    text: "I'd describe myself as spontaneous and fun-loving.",
    scoring: {
      "mbti_J": -1,
      "enneagram_7": 2,
      "disc_I": 1,
      "ocean_O": 1
    }
  },
  {
    id: 25,
    text: "I prefer working in a stable environment with clear expectations.",
    scoring: {
      "disc_S": 2,
      "enneagram_6": 1,
      "mbti_J": 1,
      "ocean_O": -1
    }
  },
  {
    id: 26,
    text: "I prefer dealing with facts and data over theories and ideas.",
    scoring: {
      "mbti_N": -2,
      "ocean_O": -1,
      "disc_C": 1,
      "enneagram_5": 1,
      "mbti_J": 1
    }
  },
  {
    id: 27,
    text: "I often put other people's needs before my own.",
    scoring: {
      "enneagram_2": 2,
      "ocean_A": 1,
      "disc_S": 1,
      "mbti_F": 1
    }
  },
  {
    id: 28,
    text: "I enjoy debating ideas, even if it gets a bit heated.",
    scoring: {
      "mbti_E": 1,
      "disc_D": 1,
      "ocean_A": -1,
      "enneagram_8": 1,
      "mbti_F": -1
    }
  },
  {
    id: 29,
    text: "I find it easy to adapt when plans change at the last minute.",
    scoring: {
      "mbti_J": -1,
      "ocean_O": 1,
      "enneagram_7": 1,
      "disc_S": -1
    }
  },
  {
    id: 30,
    text: "I tend to follow rules and respect authority.",
    scoring: {
      "disc_S": 1,
      "enneagram_1": 1,
      "enneagram_6": 1,
      "mbti_N": -1
    }
  },

  // --- Q31-40: Independence, creativity, emotional depth ---
  {
    id: 31,
    text: "I'm quick to speak up when I disagree with someone.",
    scoring: {
      "disc_D": 2,
      "enneagram_8": 2,
      "ocean_A": -1,
      "mbti_E": 1
    }
  },
  {
    id: 32,
    text: "I often get lost in my own thoughts and daydreams.",
    scoring: {
      "mbti_N": 1,
      "mbti_E": -1,
      "ocean_O": 1,
      "enneagram_4": 1
    }
  },
  {
    id: 33,
    text: "I like to have a detailed plan before starting anything.",
    scoring: {
      "mbti_J": 2,
      "ocean_C": 2,
      "disc_C": 1,
      "enneagram_6": 1
    }
  },
  {
    id: 34,
    text: "I'm energised by brainstorming sessions and bouncing ideas off other people.",
    scoring: {
      "mbti_E": 1,
      "ocean_O": 1,
      "disc_I": 1,
      "ocean_E": 1,
      "enneagram_7": 1
    }
  },
  {
    id: 35,
    text: "I get bored easily and always want to try new experiences.",
    scoring: {
      "enneagram_7": 2,
      "ocean_O": 1,
      "mbti_J": -1,
      "mbti_E": 1
    }
  },
  {
    id: 36,
    text: "I can usually tell how someone is feeling without them saying a word.",
    scoring: {
      "mbti_F": 2,
      "mbti_N": 1,
      "enneagram_2": 1,
      "ocean_N": 1
    }
  },
  {
    id: 37,
    text: "Results matter more to me than the process of getting there.",
    scoring: {
      "disc_D": 2,
      "enneagram_3": 1,
      "enneagram_8": 1,
      "ocean_C": -1
    }
  },
  {
    id: 38,
    text: "I set high expectations for myself and feel frustrated when I fall short.",
    scoring: {
      "enneagram_1": 1,
      "enneagram_3": 1,
      "ocean_N": 1,
      "ocean_C": 1
    }
  },
  {
    id: 39,
    text: "I need plenty of alone time to feel like myself.",
    scoring: {
      "mbti_E": -2,
      "ocean_E": -2,
      "enneagram_5": 2,
      "disc_I": -1
    }
  },
  {
    id: 40,
    text: "I'm drawn to art, music, or creative expression.",
    scoring: {
      "ocean_O": 2,
      "enneagram_4": 1,
      "mbti_N": 1,
      "mbti_F": 1
    }
  },

  // --- Q41-50: Trust, stability, ambition, connection ---
  {
    id: 41,
    text: "I find it hard to trust people until they've proven themselves.",
    scoring: {
      "enneagram_6": 2,
      "ocean_A": -1,
      "ocean_N": 1,
      "disc_C": 1
    }
  },
  {
    id: 42,
    text: "I enjoy helping others succeed, even if I don't get credit.",
    scoring: {
      "enneagram_2": 2,
      "disc_S": 1,
      "enneagram_9": 1,
      "ocean_A": 1
    }
  },
  {
    id: 43,
    text: "I tend to overanalyse things instead of just going with the flow.",
    scoring: {
      "enneagram_5": 1,
      "mbti_F": -1,
      "ocean_N": 1,
      "mbti_J": 1,
      "disc_C": 1
    }
  },
  {
    id: 44,
    text: "I'd rather understand the theory behind something than just know how to do it.",
    scoring: {
      "mbti_N": 2,
      "ocean_O": 1,
      "enneagram_5": 1,
      "disc_C": 1
    }
  },
  {
    id: 45,
    text: "I feel restless if my life gets too predictable.",
    scoring: {
      "enneagram_7": 1,
      "ocean_O": 1,
      "mbti_J": -2,
      "disc_S": -1
    }
  },
  {
    id: 46,
    text: "I'm competitive — I want to win at whatever I do.",
    scoring: {
      "disc_D": 2,
      "enneagram_3": 2,
      "ocean_A": -1,
      "enneagram_8": 1
    }
  },
  {
    id: 47,
    text: "I value loyalty and consistency in my relationships above all.",
    scoring: {
      "disc_S": 2,
      "enneagram_6": 1,
      "ocean_A": 1
    }
  },
  {
    id: 48,
    text: "I often feel things more deeply than the people around me.",
    scoring: {
      "enneagram_4": 2,
      "ocean_N": 1,
      "mbti_F": 1
    }
  },
  {
    id: 49,
    text: "I pick up on what needs doing and just do it — no need to be asked.",
    scoring: {
      "disc_D": 1,
      "ocean_C": 1,
      "enneagram_1": 1,
      "mbti_J": 1
    }
  },
  {
    id: 50,
    text: "I like being part of a team more than working alone.",
    scoring: {
      "mbti_E": 1,
      "disc_I": 1,
      "disc_S": 1,
      "ocean_E": 1
    }
  },

  // --- Q51-60: Self-image, vulnerability, love, identity ---
  {
    id: 51,
    text: "I care a lot about how other people see me.",
    scoring: {
      "enneagram_3": 2,
      "ocean_N": 1,
      "mbti_F": 1
    }
  },
  {
    id: 52,
    text: "People describe me as warm and approachable.",
    scoring: {
      "ocean_A": 1,
      "ocean_E": 1,
      "mbti_F": 1,
      "disc_I": 1,
      "enneagram_2": 1
    }
  },
  {
    id: 53,
    text: "I prefer to observe and understand a situation before jumping in.",
    scoring: {
      "mbti_E": -1,
      "enneagram_5": 2,
      "disc_C": 1,
      "ocean_C": 1,
      "mbti_F": -1
    }
  },
  {
    id: 54,
    text: "I'm comfortable making tough decisions that other people shy away from.",
    scoring: {
      "disc_D": 1,
      "enneagram_8": 2,
      "ocean_A": -1,
      "mbti_F": -1
    }
  },
  {
    id: 55,
    text: "I'm good at staying calm and level-headed in a crisis.",
    scoring: {
      "ocean_N": -2,
      "enneagram_9": 1,
      "disc_S": 1,
      "enneagram_8": 1
    }
  },
  {
    id: 56,
    text: "I'd rather be efficient than thorough.",
    scoring: {
      "disc_D": 1,
      "disc_C": -1,
      "ocean_C": -1,
      "enneagram_7": 1,
      "mbti_J": -1
    }
  },
  {
    id: 57,
    text: "I go out of my way to make people feel included and comfortable.",
    scoring: {
      "disc_I": 1,
      "enneagram_9": 1,
      "ocean_A": 1
    }
  },
  {
    id: 58,
    text: "When working on a team, I naturally step into the role of motivating and encouraging others.",
    scoring: {
      "disc_I": 2,
      "ocean_E": 1,
      "enneagram_2": 1,
      "mbti_E": 1
    }
  },
  {
    id: 59,
    text: "I have strong opinions and I'm not afraid to share them.",
    scoring: {
      "mbti_E": 1,
      "disc_D": 1,
      "enneagram_8": 1,
      "ocean_A": -1
    }
  },
  {
    id: 60,
    text: "I tend to keep my emotions private — only the people closest to me see that side.",
    scoring: {
      "mbti_E": -1,
      "ocean_E": -1,
      "enneagram_5": 1
    }
  }
];


// ============================================================
// PERSONALITY DATA — descriptions for all types/styles/traits
// ============================================================

const PERSONALITY_DATA = {

  // --------------------------------------------------------
  // MBTI — 16 types
  // --------------------------------------------------------
  mbti: {
    INTJ: {
      title: "The Architect",
      description: "Strategic, independent, and determined. You see the big picture and build detailed plans to get there. You value competence and logic above all, and you'd rather be right than popular.",
      strengths: ["Strategic thinking", "Independence", "Determination", "High standards", "Long-range vision"],
      weaknesses: ["Can seem cold or dismissive", "Impatient with inefficiency", "Overly critical", "Struggles with small talk"],
      famousPeople: ["Elon Musk", "Michelle Obama", "Christopher Nolan", "Jane Austen"],
      atWork: "You thrive when given complex problems and the autonomy to solve them your way. You naturally gravitate toward strategy and long-term planning, and you're at your best when you can design systems rather than manage people. Open-plan offices and endless meetings drain you — you need focused, uninterrupted time to do your best thinking.",
      inRelationships: "You show love through competence and reliability rather than grand gestures. You may not say 'I love you' often, but you'll quietly reorganise your entire life to support the people you care about. Your biggest relationship challenge is letting people in emotionally — you tend to intellectualise feelings rather than sit with them.",
      underStress: "Under pressure, you can become unusually rigid and critical — both of yourself and others. You may withdraw completely, retreating into your mind to overanalyse what went wrong. Learning to ask for help before you hit that point is your growth edge."
    },
    INTP: {
      title: "The Logician",
      description: "Curious, analytical, and inventive. Your mind is a laboratory — always testing ideas, pulling things apart, and looking for the elegant explanation. You value truth over feelings.",
      strengths: ["Analytical brilliance", "Open-mindedness", "Objectivity", "Creative problem-solving"],
      weaknesses: ["Can be absent-minded", "Overthinks decisions", "Struggles with emotional expression", "Procrastinates on routine tasks"],
      famousPeople: ["Albert Einstein", "Bill Gates", "Tina Fey", "Marie Curie"],
      atWork: "You're the person who sees the flaw in the logic that everyone else missed. You excel in roles that let you analyse, theorise, and solve novel problems — but routine tasks and office politics drain you fast. You'd rather work alone or with a small group of equally sharp minds than navigate a corporate hierarchy.",
      inRelationships: "You connect through shared curiosity and intellectual exploration. You may struggle to express emotions in conventional ways, but when you care about someone, you show it by giving them your most precious resource — your undivided attention and mental energy. You need a partner who doesn't mistake your quietness for indifference.",
      underStress: "When overwhelmed, you can spiral into analysis paralysis — endlessly researching, modelling, and second-guessing without ever acting. You may also become uncharacteristically blunt or dismissive of others' feelings. Grounding yourself in simple physical activities can help break the loop."
    },
    ENTJ: {
      title: "The Commander",
      description: "Bold, driven, and natural-born leaders. You see inefficiency as a personal challenge and you'll reorganise the world to fix it. People either follow you or get out of the way.",
      strengths: ["Decisive leadership", "Strategic planning", "Confidence", "Efficiency"],
      weaknesses: ["Can be domineering", "Impatient with slower thinkers", "Struggles to show vulnerability", "Can prioritise results over people"],
      famousPeople: ["Steve Jobs", "Margaret Thatcher", "Gordon Ramsay", "Adele"],
      atWork: "You naturally rise to leadership positions because you see what needs to happen and aren't afraid to make it happen. You set ambitious targets, delegate decisively, and hold people accountable. Your weakness is that you can steamroll quieter colleagues — the best ideas don't always come from the loudest voice.",
      inRelationships: "You bring the same intensity to your personal life that you bring to work — you're loyal, committed, and fiercely protective of the people you love. But you can default to 'fixing' mode when your partner just needs you to listen. Learning to be present without an agenda is your deepest relationship work.",
      underStress: "Under stress, you double down on control — micromanaging, pushing harder, and becoming increasingly impatient with anyone who can't keep up. In extreme cases, you may become surprisingly emotional or sensitive, which catches everyone (including you) off guard."
    },
    ENTP: {
      title: "The Debater",
      description: "Quick-witted, inventive, and endlessly curious. You love playing devil's advocate and can argue any side of any issue — not to be difficult, but because the truth lives in the tension between ideas.",
      strengths: ["Quick thinking", "Adaptability", "Charisma", "Innovation"],
      weaknesses: ["Can be argumentative", "Easily bored", "Starts more projects than finishes", "Can seem insensitive"],
      famousPeople: ["Mark Twain", "Tom Hanks", "Celine Dion", "Benjamin Franklin"],
      atWork: "You're the idea machine — the person who sees possibilities everyone else overlooked. You thrive in brainstorming sessions, pivot easily when plans change, and bring infectious energy to new projects. Your Achilles heel is follow-through: you lose interest once the novelty fades and the real work begins.",
      inRelationships: "You keep things exciting — you're playful, intellectually stimulating, and genuinely curious about the people you care about. But you can inadvertently turn emotional conversations into debates, leaving your partner feeling unheard. The growth is in learning that not every feeling needs to be challenged or solved.",
      underStress: "When stressed, you become scattered and argumentative, picking fights over small things as an outlet for deeper anxiety. You may also withdraw into obsessive research or planning as a way to feel in control. Slowing down and naming what you're actually feeling is the antidote."
    },
    INFJ: {
      title: "The Advocate",
      description: "Idealistic, insightful, and deeply principled. You have an almost uncanny ability to understand people and a quiet determination to make the world better. Rare and often misunderstood.",
      strengths: ["Deep empathy", "Vision for the future", "Determination", "Insightfulness"],
      weaknesses: ["Prone to burnout", "Overly idealistic", "Difficulty with criticism", "Can be too private"],
      famousPeople: ["Martin Luther King Jr.", "Nelson Mandela", "Lady Gaga", "Fyodor Dostoevsky"],
      atWork: "You need work that aligns with your values — a paycheck alone will never be enough. You excel in roles where you can help people grow, advocate for meaningful change, or create something with lasting impact. You're quietly influential, often shaping decisions from behind the scenes rather than seeking the spotlight.",
      inRelationships: "You form deep, almost psychic bonds with the people you love. You intuitively sense what others need, sometimes before they know it themselves. The danger is giving so much that you lose yourself — you need a partner who actively checks in on you, not just accepts your care as a given.",
      underStress: "Under pressure, you can become uncharacteristically harsh and critical, lashing out at the people closest to you. You may also retreat completely, shutting everyone out while you spiral into perfectionism or self-doubt. Recognising your stress signals early — and giving yourself permission to be imperfect — is key."
    },
    INFP: {
      title: "The Mediator",
      description: "Gentle, creative, and guided by an inner compass of values. You see beauty and meaning where others see the ordinary. Your idealism is your superpower — and sometimes your burden.",
      strengths: ["Creativity", "Empathy", "Authenticity", "Passion for causes"],
      weaknesses: ["Can be overly sensitive", "Prone to self-doubt", "Avoids conflict", "Struggles with practical details"],
      famousPeople: ["William Shakespeare", "Princess Diana", "Johnny Depp", "J.R.R. Tolkien"],
      atWork: "You do your best work when it feels personally meaningful. Routine, corporate environments slowly drain your soul, but give you a creative challenge or a cause to champion and you'll pour your heart into it. You work best independently or in small, trusted teams where you can be authentic.",
      inRelationships: "You love deeply and idealize the people you care about — which makes you a wonderfully devoted partner, but can also set you up for disappointment when reality doesn't match your vision. You crave emotional depth and authenticity, and shallow connections leave you feeling lonely even in a crowd.",
      underStress: "When overwhelmed, you withdraw into your inner world, becoming moody and self-critical. You may catastrophize or feel paralyzed by the gap between how things are and how they should be. Physical activity and creative expression — even something small — can pull you back to the surface."
    },
    ENFJ: {
      title: "The Protagonist",
      description: "Charismatic, empathetic, and born to lead with heart. You inspire others not through authority but through genuine belief in their potential. People are drawn to your warmth and vision.",
      strengths: ["Inspirational leadership", "Empathy", "Communication", "Organisational skills"],
      weaknesses: ["Can be too selfless", "Overly idealistic about people", "Struggles to say no", "Takes criticism personally"],
      famousPeople: ["Barack Obama", "Oprah Winfrey", "Maya Angelou", "John Cusack"],
      atWork: "You're the natural team leader who brings out the best in everyone. You read the room instinctively, know exactly what each person needs to hear, and create environments where people feel safe to grow. Your challenge is setting boundaries — you take on other people's problems as your own and can burn out trying to save everyone.",
      inRelationships: "You love with your whole heart and invest deeply in the growth of the people around you. You're attentive, thoughtful, and always planning ways to make your loved ones' lives better. But you can lose yourself in the caretaker role — make sure you're being loved back with the same intensity you give.",
      underStress: "Under stress, you become overly controlling about other people's well-being, pushing help on people who haven't asked for it. You may also become uncharacteristically critical or withdraw into guilt spirals about not doing enough. Remember: you can't pour from an empty cup."
    },
    ENFP: {
      title: "The Campaigner",
      description: "Enthusiastic, creative, and irresistibly charming. You see life as a grand adventure full of possibilities. Your energy is contagious and your ability to connect with people is remarkable.",
      strengths: ["Enthusiasm", "Creativity", "People skills", "Adaptability"],
      weaknesses: ["Difficulty focusing", "Overthinks emotions", "Dislikes routine", "Can overcommit"],
      famousPeople: ["Robin Williams", "Robert Downey Jr.", "Walt Disney", "Ellen DeGeneres"],
      atWork: "You bring contagious energy and creativity to everything you do. You're brilliant at generating ideas, rallying people around a vision, and making work feel like play. But structure and follow-through are your blind spots — you start ten projects with burning enthusiasm and finish three. Finding an accountability partner is game-changing for you.",
      inRelationships: "You fall in love with people's potential and make them feel like the most interesting person alive. Your warmth and curiosity create deep, electric connections. The challenge is sustaining that intensity — when the novelty fades, you may feel restless. The growth is in finding magic in the mundane, not just the new.",
      underStress: "When stressed, you become uncharacteristically withdrawn and overthink everything. You may spiral into worst-case scenarios or become hypersensitive to perceived rejection. You cope by busying yourself with new plans and possibilities — but the real relief comes from sitting still and facing whatever you're avoiding."
    },
    ISTJ: {
      title: "The Logistician",
      description: "Reliable, thorough, and quietly determined. You're the backbone that holds things together while everyone else is improvising. Duty and responsibility aren't burdens to you — they're how you show up.",
      strengths: ["Reliability", "Thoroughness", "Loyalty", "Practical problem-solving"],
      weaknesses: ["Can be rigid", "Resistant to change", "Struggles to express emotions", "Overly focused on rules"],
      famousPeople: ["Queen Elizabeth II", "Warren Buffett", "Angela Merkel", "George Washington"],
      atWork: "You're the person who actually reads the documentation, follows the process, and delivers on time — every time. You excel in roles with clear expectations and defined procedures. You may not be the loudest voice in the room, but your track record speaks volumes. Your challenge is adapting when the rules change or don't exist yet.",
      inRelationships: "You show love through consistency and reliability — showing up, keeping promises, and quietly building a stable life together. You may not be the most emotionally expressive partner, but your loyalty is absolute. The growth area is learning to open up about your feelings before they build into resentment.",
      underStress: "Under pressure, you become rigidly focused on rules and procedures, even when flexibility is clearly needed. You may catastrophize about things falling apart and try to control every detail. Physical tension is your tell — you carry stress in your body long before you acknowledge it mentally."
    },
    ISFJ: {
      title: "The Defender",
      description: "Warm, dependable, and quietly devoted. You remember the little things about people and show love through consistent, practical care. The world runs on people like you, even if it doesn't always notice.",
      strengths: ["Loyalty", "Attention to detail", "Patience", "Supportiveness"],
      weaknesses: ["Can be taken for granted", "Avoids conflict", "Resistant to change", "Overworks themselves"],
      famousPeople: ["Beyonce", "Kate Middleton", "Vin Diesel", "Mother Teresa"],
      atWork: "You're the quiet hero of every team — the one who remembers deadlines, follows up on loose ends, and makes sure nothing falls through the cracks. You thrive in supportive roles where your attention to detail and dedication are valued. Your challenge is speaking up for yourself when your contributions go unrecognised.",
      inRelationships: "You love through acts of service — remembering someone's coffee order, anticipating their needs, creating a warm and stable home. You're deeply loyal and will sacrifice your own comfort for the people you love. The risk is giving until you're empty. You need someone who notices what you do and gives back with the same care.",
      underStress: "When overwhelmed, you become quietly resentful, keeping a mental tally of everything you've done that hasn't been acknowledged. You may also become unusually pessimistic or withdraw into passive-aggressive behaviour. The antidote is speaking up before the pressure builds — your needs matter too."
    },
    ESTJ: {
      title: "The Executive",
      description: "Organised, direct, and built for getting things done. You value order, tradition, and clear expectations. When you commit to something, it gets done — on time and on budget.",
      strengths: ["Organisation", "Dedication", "Strong will", "Direct communication"],
      weaknesses: ["Can be inflexible", "Struggles with emotional nuance", "Overly focused on status quo", "Can seem bossy"],
      famousPeople: ["Judge Judy", "Sonia Sotomayor", "Frank Sinatra", "Lyndon B. Johnson"],
      atWork: "You're the person who turns chaos into order. You set clear expectations, create efficient processes, and hold everyone (yourself included) accountable. You respect hierarchy and tradition, and you expect others to pull their weight. Your blind spot is dismissing new approaches simply because 'that's not how we do things.'",
      inRelationships: "You show love by creating structure and stability — planning holidays, managing finances, making sure everything runs smoothly. You're dependable and honest, sometimes to a fault. Your growth edge is learning that emotional conversations can't be managed like a project — sometimes people need empathy, not solutions.",
      underStress: "Under stress, you become even more controlling and rigid, demanding compliance from everyone around you. You may lash out at perceived laziness or incompetence. In extreme cases, you can become surprisingly emotional and feel unappreciated for everything you do. Stepping back and delegating is your best medicine."
    },
    ESFJ: {
      title: "The Consul",
      description: "Caring, social, and eager to help. You're the glue in every group — making sure everyone's included, comfortable, and taken care of. Harmony isn't just nice to have, it's essential.",
      strengths: ["Warmth", "Loyalty", "Sensitivity to others", "Strong practical skills"],
      weaknesses: ["Needs approval", "Avoids conflict", "Can be controlling out of caring", "Struggles with criticism"],
      famousPeople: ["Taylor Swift", "Jennifer Garner", "Bill Clinton", "Danny Glover"],
      atWork: "You create the culture that makes everyone want to show up. You remember birthdays, organise team events, and make new people feel welcome. You thrive in roles that combine people skills with practical execution — HR, teaching, healthcare, event management. Your challenge is not taking workplace conflict personally.",
      inRelationships: "You pour energy into making your relationships work — planning dates, remembering anniversaries, checking in on how everyone's doing. You need verbal affirmation and appreciation to feel secure. The growth area is learning that healthy conflict isn't a sign of failure — sometimes the most loving thing is an honest disagreement.",
      underStress: "When stressed, you become people-pleasing to an extreme, sacrificing your own needs to keep the peace. You may also become gossipy or passive-aggressive when you feel unappreciated. In tough moments, you can catastrophize about relationships falling apart. Journalling or talking to one trusted person helps you process."
    },
    ISTP: {
      title: "The Virtuoso",
      description: "Practical, observant, and cool under pressure. You learn by doing, fix things by taking them apart, and prefer action over discussion. Freedom and hands-on experience are what drive you.",
      strengths: ["Problem-solving", "Adaptability", "Calm in crisis", "Mechanical/technical skill"],
      weaknesses: ["Can seem detached", "Risk-taking", "Commitment-averse", "Struggles with long-term planning"],
      famousPeople: ["Clint Eastwood", "Bruce Lee", "Amelia Earhart", "Bear Grylls"],
      atWork: "You're at your best when you can work with your hands or solve tangible problems — coding, engineering, troubleshooting, building. You need autonomy and hate being micromanaged. Meetings about meetings make you want to walk out. Give you a broken thing and the freedom to fix it, and you're in your element.",
      inRelationships: "You show love through actions, not words — fixing things around the house, showing up when it counts, giving your partner space to be themselves. You're not naturally expressive about emotions, which can frustrate partners who need verbal reassurance. The growth is learning that saying 'I love you' matters, even when you think it's obvious.",
      underStress: "Under pressure, you withdraw and become even more closed-off emotionally. You may take impulsive physical risks or throw yourself into a project to avoid dealing with feelings. In extreme stress, you can become uncharacteristically emotional or explosive. Movement and hands-on activity are your healthiest outlets."
    },
    ISFP: {
      title: "The Adventurer",
      description: "Gentle, artistic, and quietly passionate. You experience the world through your senses and express yourself through action, not words. Your authenticity is magnetic.",
      strengths: ["Artistic sensitivity", "Kindness", "Flexibility", "Living in the moment"],
      weaknesses: ["Avoids planning", "Overly sensitive to criticism", "Unpredictable", "Fiercely private"],
      famousPeople: ["Bob Dylan", "Frida Kahlo", "Michael Jackson", "Lana Del Rey"],
      atWork: "You need work that engages your senses and values — design, music, cooking, nature, healing. Rigid corporate environments feel suffocating. You do your best work when you can express your personal style and work at your own pace. Your challenge is that you may avoid career planning entirely, preferring to see where life takes you.",
      inRelationships: "You love quietly but deeply — through shared experiences, thoughtful gestures, and simply being present. You need a partner who respects your need for space and doesn't pressure you to be more outwardly expressive than you are. When you feel safe, you reveal a rich inner world that few people ever get to see.",
      underStress: "When overwhelmed, you shut down and withdraw, becoming unusually passive or indifferent. You may make impulsive decisions — quitting a job, ending a relationship — as a way to escape the pressure. Creative expression is your lifeline: even a few minutes of making something can restore your equilibrium."
    },
    ESTP: {
      title: "The Entrepreneur",
      description: "Bold, energetic, and always where the action is. You think on your feet, take risks others won't, and thrive in high-pressure situations. Rules are guidelines at best.",
      strengths: ["Boldness", "Quick thinking", "Sociability", "Perceptiveness"],
      weaknesses: ["Impatient", "Risk-prone", "Insensitive at times", "Dislikes theory and abstraction"],
      famousPeople: ["Ernest Hemingway", "Madonna", "Donald Trump", "Eddie Murphy"],
      atWork: "You thrive in fast-paced, high-stakes environments — sales, emergency services, entrepreneurship, sports. You're the person everyone wants on their team when things go sideways because you stay calm and act decisively. Your weakness is patience: you'd rather wing it than sit through a planning session.",
      inRelationships: "You bring excitement and spontaneity to your relationships — life with you is never boring. You're generous, fun, and fiercely present in the moment. The challenge is depth: you can avoid serious emotional conversations by changing the subject or cracking a joke. Your partner needs to know that underneath the bravado, you care deeply.",
      underStress: "Under stress, you become restless and impulsive, making rash decisions you'll later regret. You may pick fights, take unnecessary risks, or distract yourself with sensation-seeking behaviour. In extreme cases, you can become surprisingly anxious and paranoid. Slowing down — physically and mentally — is the hardest but most helpful thing you can do."
    },
    ESFP: {
      title: "The Entertainer",
      description: "Spontaneous, energetic, and the life of every party. You turn ordinary moments into memories and make everyone around you feel alive. Life is too short to be serious all the time.",
      strengths: ["Enthusiasm", "Practicality", "Observation", "People skills"],
      weaknesses: ["Easily bored", "Poor long-term planning", "Avoids difficult conversations", "Sensitive to criticism"],
      famousPeople: ["Marilyn Monroe", "Jamie Oliver", "Adele", "Will Smith"],
      atWork: "You bring energy and warmth to any workplace. You're at your best in roles that involve people, performance, or hands-on creativity — teaching, hospitality, entertainment, healthcare. You struggle with desk-bound work and long-term planning, but you're unbeatable at reading a room and adapting on the fly.",
      inRelationships: "You make your loved ones feel like the most special people in the world — generous with your time, affection, and enthusiasm. You live to create shared experiences and memories. The challenge is staying engaged when the excitement fades — real intimacy requires sitting through the uncomfortable, boring, and hard moments too.",
      underStress: "When stressed, you may become uncharacteristically negative and withdrawn, fixating on worst-case scenarios that feel completely out of character. You might also overindulge in comfort-seeking behaviour — shopping, eating, socialising — to avoid facing the real issue. Talking to someone you trust, honestly and without performing, is your best path through."
    }
  },

  // --------------------------------------------------------
  // Enneagram — 9 types
  // --------------------------------------------------------
  enneagram: {
    1: {
      title: "The Reformer",
      description: "You have a strong sense of right and wrong and a deep desire to improve yourself and the world. Principled, purposeful, and self-controlled — but also self-critical.",
      strengths: ["Integrity", "Responsibility", "Attention to quality", "Fairness"],
      weaknesses: ["Perfectionism", "Rigidity", "Self-criticism", "Resentment when standards aren't met"],
      famousPeople: ["Mahatma Gandhi", "Michelle Obama", "Martha Stewart", "Brene Brown"],
      wing1w9: "The Idealist — principled like a 1 but with the calm, accepting nature of a 9. You're diplomatic and composed.",
      wing1w2: "The Advocate — principled like a 1 but with the warmth and helpfulness of a 2. You're passionate about helping people do better.",
      coreMotivation: "To be good, to have integrity, and to live according to your highest principles.",
      coreFear: "Being corrupt, evil, or fundamentally flawed in a way you can't fix.",
      growthPath: "Your growth comes from learning that imperfection is not the same as failure. The inner critic that drives you to improve everything is also the voice that never lets you rest. True growth happens when you can see a mistake — yours or someone else's — and respond with compassion instead of correction. The world doesn't need you to be perfect; it needs you to be kind, starting with yourself."
    },
    2: {
      title: "The Helper",
      description: "You're driven by a desire to be loved and needed. Generous, warm, and people-pleasing — you show love through action and sometimes forget to take care of yourself.",
      strengths: ["Generosity", "Warmth", "Empathy", "Supportiveness"],
      weaknesses: ["People-pleasing", "Difficulty setting boundaries", "Possessiveness", "Martyr complex"],
      famousPeople: ["Mother Teresa", "Dolly Parton", "Desmond Tutu", "Mr. Rogers"],
      wing2w1: "The Servant — helpful like a 2 but with the moral drive of a 1. You serve others because it's the right thing to do.",
      wing2w3: "The Host — helpful like a 2 but with the charm and ambition of a 3. You love being appreciated for your generosity.",
      coreMotivation: "To be loved, to be needed, and to feel that your presence makes other people's lives better.",
      coreFear: "Being unwanted, unneeded, or unworthy of love without doing something to earn it.",
      growthPath: "Your growth comes from learning that you are lovable for who you are, not just for what you do for others. The hardest question for you is 'What do I need?' — not as a setup to then help someone else, but genuinely for yourself. Real generosity starts with filling your own cup first. When you can receive help as gracefully as you give it, you'll find the love you've been working so hard to earn was already there."
    },
    3: {
      title: "The Achiever",
      description: "You're driven by a need to succeed and be seen as successful. Adaptable, efficient, and image-conscious — you know how to read a room and become what's needed to win.",
      strengths: ["Ambition", "Efficiency", "Adaptability", "Inspirational energy"],
      weaknesses: ["Image-obsessed", "Workaholic tendencies", "Competitive to a fault", "Loses touch with true feelings"],
      famousPeople: ["Oprah Winfrey", "Tony Robbins", "Beyonce", "Tom Cruise"],
      wing3w2: "The Charmer — achievement-oriented like a 3 but with the warmth of a 2. You succeed by making people love you.",
      wing3w4: "The Professional — achievement-oriented like a 3 but with the depth of a 4. You want success, but it has to feel authentic.",
      coreMotivation: "To be admired, to succeed, and to feel that you are valuable because of what you've achieved.",
      coreFear: "Being worthless, being a failure, or being exposed as less impressive than you appear.",
      growthPath: "Your growth comes from separating who you are from what you achieve. You've spent your life becoming what others admire, and somewhere along the way you may have lost touch with what you actually want. The breakthrough happens when you let someone see you struggling, unpolished, and unsure — and discover that you're still loved. Your worth was never contingent on your resume."
    },
    4: {
      title: "The Individualist",
      description: "You feel things deeply and crave authenticity above all. Creative, sensitive, and emotionally honest — you'd rather feel pain than numbness. Being ordinary is your worst fear.",
      strengths: ["Creativity", "Emotional depth", "Authenticity", "Compassion for suffering"],
      weaknesses: ["Moodiness", "Self-absorption", "Envy", "Feeling misunderstood"],
      famousPeople: ["Frida Kahlo", "Prince", "Virginia Woolf", "Amy Winehouse"],
      wing4w3: "The Aristocrat — creative like a 4 but with the drive and polish of a 3. You want your uniqueness recognised and celebrated.",
      wing4w5: "The Bohemian — creative like a 4 but with the intellectual depth of a 5. You're introspective, unconventional, and fiercely independent.",
      coreMotivation: "To find yourself, to be unique, and to express the depth of what you feel in a way the world can understand.",
      coreFear: "Having no identity or significance — being ordinary, forgettable, or emotionally shallow.",
      growthPath: "Your growth comes from realising that you don't need to suffer to be special. The envy you sometimes feel toward others isn't really about what they have — it's about a sense that something essential is missing in you. It isn't. Your depth, your sensitivity, your ability to find beauty in darkness — these are gifts, not wounds. Growth means showing up for the ordinary moments too, not just the dramatic ones."
    },
    5: {
      title: "The Investigator",
      description: "You're driven by a need to understand the world. Perceptive, cerebral, and private — you collect knowledge like others collect possessions. Your inner world is vast.",
      strengths: ["Analytical thinking", "Independence", "Objectivity", "Expertise"],
      weaknesses: ["Emotional detachment", "Isolation", "Hoarding energy and resources", "Analysis paralysis"],
      famousPeople: ["Albert Einstein", "Bill Gates", "Stephen Hawking", "Jane Goodall"],
      wing5w4: "The Iconoclast — analytical like a 5 but with the creative intensity of a 4. You're drawn to unconventional ideas.",
      wing5w6: "The Problem Solver — analytical like a 5 but with the loyalty and caution of a 6. You're thorough, reliable, and deeply competent.",
      coreMotivation: "To understand the world, to be capable and competent, and to have enough resources (knowledge, energy, space) to feel safe.",
      coreFear: "Being helpless, incapable, or overwhelmed by the demands of the world and the people in it.",
      growthPath: "Your growth comes from stepping out of the observation booth and into the arena. You've built a fortress of knowledge and independence, but real life happens in connection — messy, unpredictable, emotional connection. You don't need to understand everything before you act. Sometimes the most courageous thing a Five can do is say 'I don't know, but I'm here anyway.'"
    },
    6: {
      title: "The Loyalist",
      description: "You're driven by a need for security and support. Loyal, responsible, and vigilant — you're the person who thinks of everything that could go wrong (and prepares for it).",
      strengths: ["Loyalty", "Courage under pressure", "Preparedness", "Team-building"],
      weaknesses: ["Anxiety", "Suspicion", "Indecisiveness", "Worst-case thinking"],
      famousPeople: ["Tom Hanks", "Princess Diana", "Mark Twain", "Jennifer Aniston"],
      wing6w5: "The Defender — loyal like a 6 but with the analytical mind of a 5. You protect through knowledge and preparation.",
      wing6w7: "The Buddy — loyal like a 6 but with the optimism and energy of a 7. You handle anxiety by staying active and connected.",
      coreMotivation: "To feel secure, to have support and guidance, and to know that you can trust the people and systems around you.",
      coreFear: "Being without support, being caught off guard, or being unable to survive on your own.",
      growthPath: "Your growth comes from trusting yourself as much as you trust your preparation. You scan for danger because you believe the world is inherently unsafe — but the courage you show in the face of that fear is your greatest strength. Growth means learning to sit with uncertainty without spiralling, and recognising that the worst-case scenario you've been preparing for almost never actually arrives."
    },
    7: {
      title: "The Enthusiast",
      description: "You're driven by a desire for happiness and new experiences. Spontaneous, versatile, and optimistic — your enthusiasm is contagious but sitting with difficult emotions is your challenge.",
      strengths: ["Optimism", "Versatility", "Quick thinking", "Adventurousness"],
      weaknesses: ["Scattered attention", "Avoidance of pain", "Overcommitting", "Superficiality"],
      famousPeople: ["Robin Williams", "Jim Carrey", "Richard Branson", "Elton John"],
      wing7w6: "The Entertainer — fun-loving like a 7 but grounded by the loyalty of a 6. You're playful but care deeply about your people.",
      wing7w8: "The Realist — fun-loving like a 7 but with the boldness of an 8. You're ambitious, assertive, and always chasing the next big thing.",
      coreMotivation: "To be happy, to experience everything life has to offer, and to avoid being trapped in pain or boredom.",
      coreFear: "Being deprived, trapped in suffering, or missing out on the good things life has to offer.",
      growthPath: "Your growth comes from learning that the happiness you chase is often running from something you need to feel. The constant planning, the packed schedule, the relentless optimism — they're beautiful, but they can also be armour against grief, loneliness, or fear. Real depth comes when you stay present with the uncomfortable feelings instead of reframing them into something positive. The joy that follows is quieter but far more real."
    },
    8: {
      title: "The Challenger",
      description: "You're driven by a need to be strong and in control. Powerful, protective, and direct — you stand up for yourself and the underdog. Vulnerability is the one thing that scares you.",
      strengths: ["Confidence", "Decisiveness", "Protectiveness", "Leadership"],
      weaknesses: ["Domineering", "Confrontational", "Struggles with vulnerability", "Excessive intensity"],
      famousPeople: ["Martin Luther King Jr.", "Winston Churchill", "Serena Williams", "Kamala Harris"],
      wing8w7: "The Maverick — powerful like an 8 but with the energy and optimism of a 7. You're bold, charismatic, and unstoppable.",
      wing8w9: "The Bear — powerful like an 8 but with the calm steadiness of a 9. You're a quiet force who only shows your strength when it matters.",
      coreMotivation: "To be strong, to protect yourself and the people you love, and to never be controlled or vulnerable.",
      coreFear: "Being weak, powerless, or at the mercy of someone else's decisions.",
      growthPath: "Your growth comes from discovering that vulnerability is not weakness — it's the ultimate form of strength. You've built walls to protect the tender, caring person inside, but those walls also keep out the intimacy you secretly crave. The bravest thing an Eight can do isn't confronting an enemy — it's letting someone see you cry, admitting you're scared, or saying 'I need you.' That's where your real power lives."
    },
    9: {
      title: "The Peacemaker",
      description: "You're driven by a desire for inner and outer peace. Easy-going, accepting, and reassuring — you see all sides and bring people together. But you sometimes lose yourself in the process.",
      coreMotivation: "To have inner peace, to maintain harmony, and to avoid conflict and disconnection.",
      coreFear: "Loss, separation, or being so assertive that you drive people away and shatter the peace.",
      growthPath: "Your growth comes from realising that your voice matters — and that using it won't destroy the harmony you've worked so hard to maintain. You merge with others' agendas so naturally that you may have forgotten what you actually want. The most radical act of peace you can perform is getting angry on your own behalf. Your presence is a gift, but only when you're truly in it — not checked out, not numbing, not just going along. Wake up to your own life.",
      strengths: ["Diplomacy", "Patience", "Acceptance", "Calming presence"],
      weaknesses: ["Passivity", "Avoidance", "Stubbornness through inaction", "Losing sense of self"],
      famousPeople: ["Abraham Lincoln", "Queen Elizabeth II", "Keanu Reeves", "Bob Marley"],
      wing9w8: "The Referee — peaceful like a 9 but with the assertiveness of an 8. When you finally speak up, people listen.",
      wing9w1: "The Dreamer — peaceful like a 9 but with the principled nature of a 1. You have a quiet idealism and a vision of how things should be."
    }
  },

  // --------------------------------------------------------
  // DISC — Primary and combination styles
  // --------------------------------------------------------
  disc: {
    D: {
      title: "Dominant",
      description: "You're direct, results-oriented, and competitive. You thrive on challenge and move fast. People know where they stand with you — you don't sugarcoat.",
      strengths: ["Decisiveness", "Drive", "Confidence", "Big-picture thinking"],
      weaknesses: ["Impatience", "Insensitivity", "Overly controlling", "Poor listener"],
      famousPeople: ["Steve Jobs", "Margaret Thatcher", "Gordon Ramsay", "Serena Williams"],
      communicationStyle: "Be direct and get to the point — you respect people who don't waste your time. Skip the small talk and lead with the bottom line. When communicating with others, remember that not everyone processes information as quickly as you do. Pausing to ask 'What do you think?' goes a long way.",
      idealEnvironment: "Fast-paced, results-driven, with clear authority and minimal bureaucracy — somewhere you can make decisions and see immediate impact."
    },
    I: {
      title: "Influential",
      description: "You're enthusiastic, optimistic, and a natural connector. You light up a room and motivate through energy and charm. People want to be around you.",
      strengths: ["Persuasion", "Enthusiasm", "Collaboration", "Creativity"],
      weaknesses: ["Disorganised", "Overly talkative", "Avoids details", "Overpromises"],
      famousPeople: ["Robin Williams", "Oprah Winfrey", "Will Smith", "Ellen DeGeneres"],
      communicationStyle: "You communicate with enthusiasm and storytelling — you make ideas feel exciting and people feel included. When working with detail-oriented colleagues, try to back up your vision with specifics. Others may need data, not just energy, to get on board.",
      idealEnvironment: "Collaborative, social, and creative — somewhere with open communication, team brainstorming, and recognition for contributions."
    },
    S: {
      title: "Steady",
      description: "You're patient, reliable, and team-oriented. You provide stability and support, and you value harmony and consistency. Change doesn't scare you — you just prefer it gradual.",
      strengths: ["Patience", "Loyalty", "Supportiveness", "Consistency"],
      weaknesses: ["Resistance to change", "Difficulty saying no", "Passivity", "Avoids confrontation"],
      famousPeople: ["Mother Teresa", "Mr Rogers", "Gandhi", "Kate Middleton"],
      communicationStyle: "You communicate with warmth and patience, making others feel heard and valued. You prefer one-on-one conversations over group debates. When you need to push back, practise being direct rather than hinting — people respect honesty, and your kindness will soften the message naturally.",
      idealEnvironment: "Stable, supportive, and team-oriented — somewhere with predictable routines, collaborative relationships, and time to do things thoroughly."
    },
    C: {
      title: "Conscientious",
      description: "You're analytical, precise, and quality-driven. You want things done right and you'll take the time to make sure they are. Accuracy matters more than speed.",
      strengths: ["Accuracy", "Analytical thinking", "High standards", "Systematic approach"],
      weaknesses: ["Over-analysis", "Perfectionism", "Difficulty delegating", "Too cautious"],
      famousPeople: ["Albert Einstein", "Marie Curie", "Bill Gates", "Satya Nadella"],
      communicationStyle: "You communicate with precision — you choose your words carefully and expect others to do the same. You prefer written communication where you can think before responding. In fast-moving conversations, try to share your initial thinking rather than waiting for the perfect answer — your 80% is better than most people's 100%.",
      idealEnvironment: "Structured, quality-focused, and intellectually stimulating — somewhere with clear standards, access to data, and the time to do thorough work."
    },
    DI: {
      title: "The Driver",
      description: "You combine drive with charm. You push for results but bring people along with your energy and enthusiasm. A natural leader who inspires action.",
      strengths: ["Motivational leadership", "Quick decisions", "Charisma with substance"],
      weaknesses: ["Impatient with details", "Can be overwhelming", "Struggles to slow down"]
    },
    DC: {
      title: "The Architect",
      description: "You combine drive with precision. You want results, but only the right results. Strategic, demanding, and thorough — you hold yourself and others to high standards.",
      strengths: ["Strategic thinking", "High standards", "Efficiency", "Independence"],
      weaknesses: ["Overly critical", "Demanding", "Cold under pressure"]
    },
    DS: {
      title: "The Anchor",
      description: "You combine determination with reliability. You push forward but also care about keeping the team together. A steady hand that doesn't shy from tough calls.",
      strengths: ["Reliable leadership", "Persistence", "Balanced decision-making"],
      weaknesses: ["Stubborn", "Can send mixed signals", "Struggle between speed and stability"]
    },
    ID: {
      title: "The Motivator",
      description: "You combine enthusiasm with ambition. You're the spark that lights the fire and the wind that keeps it burning. Inspiring, bold, and action-oriented.",
      strengths: ["Inspiration", "Energy", "Risk-taking", "Vision"],
      weaknesses: ["Impulsive", "Impatient", "Overlooks details"]
    },
    IS: {
      title: "The Counsellor",
      description: "You combine warmth with patience. People open up to you because you listen with genuine interest and make them feel safe. A natural relationship-builder.",
      strengths: ["Empathy", "Active listening", "Team building", "Trustworthiness"],
      weaknesses: ["Avoids tough feedback", "Indecisive", "Can prioritise feelings over facts"]
    },
    IC: {
      title: "The Communicator",
      description: "You combine charm with attention to detail. You can explain complex ideas in simple terms and make accuracy feel exciting. Great at persuading with facts.",
      strengths: ["Clear communication", "Enthusiasm for quality", "Bridge between people and data"],
      weaknesses: ["Perfectionistic about presentation", "Can overexplain", "Needs external validation"]
    },
    SD: {
      title: "The Stabiliser",
      description: "You combine patience with quiet authority. You maintain stability but aren't afraid to assert yourself when things go off track. A calm, dependable leader.",
      strengths: ["Steady leadership", "Conflict resolution", "Persistence"],
      weaknesses: ["Slow to change", "Can suppress frustration", "Reluctant to delegate"]
    },
    SI: {
      title: "The Supporter",
      description: "You combine reliability with warmth. You're the person everyone counts on — not just to get things done, but to make people feel valued while doing it.",
      strengths: ["Teamwork", "Consistency", "Warmth", "Dependability"],
      weaknesses: ["Overly accommodating", "Struggles with confrontation", "Can be taken advantage of"]
    },
    SC: {
      title: "The Specialist",
      description: "You combine patience with precision. You take your time to do things right and you're deeply knowledgeable in your area. Quiet competence is your hallmark.",
      strengths: ["Deep expertise", "Reliability", "Thoroughness", "Calm under pressure"],
      weaknesses: ["Resistant to change", "Overly cautious", "Can miss the big picture"]
    },
    CD: {
      title: "The Strategist",
      description: "You combine analysis with action. You think things through meticulously, then execute with force. Nothing gets past you — and nothing stops you.",
      strengths: ["Strategic execution", "Thoroughness with drive", "High standards"],
      weaknesses: ["Demanding", "Overly critical", "Impatient with others' mistakes"]
    },
    CI: {
      title: "The Analyst",
      description: "You combine precision with persuasion. You're not just about the numbers — you can sell the story behind them. Data-driven but people-aware.",
      strengths: ["Data storytelling", "Thorough analysis", "Balanced perspective"],
      weaknesses: ["Overthinks presentations", "Can be indecisive", "Perfectionist about communication"]
    },
    CS: {
      title: "The Planner",
      description: "You combine precision with patience. You create systems that work and maintain them with care. Reliable, methodical, and deeply competent.",
      strengths: ["Systems thinking", "Reliability", "Quality focus", "Patience"],
      weaknesses: ["Over-cautious", "Resistant to change", "Difficulty with ambiguity"]
    }
  },

  // --------------------------------------------------------
  // Big Five / OCEAN — High and Low descriptions per trait
  // --------------------------------------------------------
  bigFive: {
    O: {
      name: "Openness to Experience",
      high: {
        label: "Exploratory",
        description: "You're imaginative, curious, and open to new ideas. Art, philosophy, and unconventional thinking energise you. You'd rather explore than stick to what's known.",
        detail: "Your mind is always reaching for something new — a different perspective, an untested idea, a creative solution no one else considered. You're drawn to art, culture, travel, and deep conversation. This makes you wonderfully adaptable and innovative, but it can also make you restless with routine. You may struggle in environments that reward conformity over creativity. Your challenge is channelling your openness into depth, not just breadth — finishing the novel, not just starting ten."
      },
      low: {
        label: "Practical",
        description: "You're grounded, conventional, and prefer the familiar. You value practical solutions over theoretical ones and find comfort in routine and tradition.",
        detail: "You trust what's proven over what's theoretical, and you find comfort in the familiar. This isn't closed-mindedness — it's wisdom about what actually works. You're the person who keeps things running while others chase shiny ideas. Your reliability and common sense are invaluable in any team. Your growth edge is staying open to new approaches even when the old ones still work — sometimes the unfamiliar path leads somewhere better."
      }
    },
    C: {
      name: "Conscientiousness",
      high: {
        label: "Disciplined",
        description: "You're organised, dependable, and goal-oriented. You make plans and follow through. People trust you to get things done because you always do.",
        detail: "You're the person who writes the to-do list, prioritises it, and actually checks things off. Your self-discipline is genuine — you don't need external motivation because your internal standards are already high. This makes you incredibly reliable and successful in structured environments. The flip side is that you can be hard on yourself when you fall short, and you may judge others who don't share your work ethic. Learning to rest without guilt is your underrated superpower."
      },
      low: {
        label: "Flexible",
        description: "You're spontaneous, adaptable, and prefer to go with the flow. Rigid schedules and detailed plans feel like chains. You trust the process over the plan.",
        detail: "You thrive in environments that reward adaptability over rigid planning. You respond brilliantly to the unexpected because you're not locked into a script. Your casual approach to deadlines and structure isn't laziness — it's a genuine preference for flexibility and improvisation. Your best work often comes in bursts of inspiration rather than steady routine. The growth area is building just enough structure to capture your best ideas before they evaporate."
      }
    },
    E: {
      name: "Extraversion",
      high: {
        label: "Outgoing",
        description: "You're energised by people, social situations, and activity. You talk to think, act before waiting, and feel most alive in a crowd.",
        detail: "Social energy isn't just something you enjoy — it's how you recharge. You process your thoughts by talking them through, and you're at your best when surrounded by people and activity. You bring warmth and enthusiasm to groups, and people are naturally drawn to your energy. Your challenge is making space for quieter voices and learning that silence doesn't always need to be filled. Some of your deepest insights will come in the quiet moments between conversations."
      },
      low: {
        label: "Reserved",
        description: "You're energised by solitude, reflection, and quiet. You think before speaking, prefer depth over breadth in relationships, and value your inner world.",
        detail: "Solitude isn't loneliness for you — it's where you do your best thinking, recharge your energy, and connect with yourself. You prefer a small circle of deep relationships over a large network of acquaintances. When you do speak, people listen, because you've thought carefully about what you want to say. Your challenge is making sure your need for space doesn't become isolation, and that the people who matter to you know they're valued even when you're quiet."
      }
    },
    A: {
      name: "Agreeableness",
      high: {
        label: "Compassionate",
        description: "You're warm, trusting, and cooperative. You care about others' feelings and prefer harmony. People feel safe around you because you genuinely want the best for them.",
        detail: "You create psychological safety wherever you go — people open up to you because they sense your genuine care. You're the natural mediator, the person who smooths tensions and finds common ground. This is a rare and valuable gift, especially in a world that rewards aggression. Your growth edge is learning to advocate for yourself with the same compassion you show others. Saying 'no' or disagreeing isn't unkind — it's honest."
      },
      low: {
        label: "Challenging",
        description: "You're direct, sceptical, and competitive. You say what you think, question assumptions, and aren't afraid to ruffle feathers. Respect is earned, not given.",
        detail: "You see through pleasantries to the truth underneath, and you're not afraid to name it. This directness makes you an excellent critical thinker, negotiator, and leader — people know exactly where they stand with you. You push back on bad ideas that others accept out of politeness. Your growth edge is learning that being right isn't always the priority — sometimes the relationship matters more than the argument, and softening your delivery doesn't weaken your message."
      }
    },
    N: {
      name: "Neuroticism",
      high: {
        label: "Sensitive",
        description: "You feel things intensely — stress, worry, and emotional ups and downs are part of your landscape. This sensitivity also makes you attuned to subtle shifts others miss.",
        detail: "Your emotional antenna picks up signals that others miss entirely — a shift in someone's tone, tension in a room, the unspoken thing behind the words. This sensitivity is a genuine gift for empathy, creativity, and connection. The cost is that you also absorb more stress, worry, and emotional turbulence than most people. Building practices that help you process and release emotions — journalling, movement, therapy, creative expression — isn't optional for you. It's essential maintenance."
      },
      low: {
        label: "Resilient",
        description: "You're emotionally stable and calm under pressure. Setbacks don't derail you easily. You bring a steady, grounding energy to stressful situations.",
        detail: "You're the calm in the storm — the person others look to when things fall apart. Your emotional stability isn't numbness; it's a genuine capacity to absorb pressure without being overwhelmed by it. You recover from setbacks quickly and don't dwell on negative experiences. This is an enormous strength in leadership and crisis situations. Your growth edge is making sure your steadiness doesn't become dismissiveness — just because something doesn't bother you doesn't mean it's not real for someone else."
      }
    }
  },

};


// ============================================================
// SCORING / CLASSIFICATION FUNCTIONS
// ============================================================

/**
 * Calculate results for all 4 personality frameworks from quiz answers.
 * @param {Array<{questionId: number, score: number}>} answers - Array of answers (score is 1-5)
 * @returns {Object} Results for MBTI, Enneagram, DISC, and Big Five
 */
function calculateResults(answers) {
  // Initialise raw score accumulators
  const rawScores = {};
  const questionCounts = {};

  // Process each answer
  answers.forEach(answer => {
    const question = QUESTIONS.find(q => q.id === answer.questionId);
    if (!question) return;

    // Convert 1-5 Likert to -2 to +2 centred scale
    const centredScore = answer.score - 3; // -2, -1, 0, +1, +2

    Object.entries(question.scoring).forEach(([dimension, weight]) => {
      if (!rawScores[dimension]) {
        rawScores[dimension] = 0;
        questionCounts[dimension] = 0;
      }
      rawScores[dimension] += centredScore * weight;
      questionCounts[dimension] += 1;
    });
  });

  // --- MBTI ---
  const mbtiResult = calculateMBTI(rawScores);

  // --- Enneagram ---
  const enneagramResult = calculateEnneagram(rawScores);

  // --- DISC ---
  const discResult = calculateDISC(rawScores);

  // --- Big Five ---
  const bigFiveResult = calculateBigFive(rawScores, questionCounts);

  return {
    mbti: mbtiResult,
    enneagram: enneagramResult,
    disc: discResult,
    bigFive: bigFiveResult
  };
}

function calculateMBTI(rawScores) {
  // For each dimension, positive = first letter, negative = second letter
  // mbti_E: positive = E, negative = I
  // mbti_N: positive = N, negative = S
  // mbti_F: positive = F, negative = T
  // mbti_J: positive = J, negative = P

  const E_I = rawScores["mbti_E"] || 0;
  const N_S = rawScores["mbti_N"] || 0;
  const F_T = rawScores["mbti_F"] || 0;
  const J_P = rawScores["mbti_J"] || 0;

  const type = (E_I >= 0 ? "E" : "I") +
               (N_S >= 0 ? "N" : "S") +
               (F_T >= 0 ? "F" : "T") +
               (J_P >= 0 ? "J" : "P");

  // Calculate preference strengths as percentages (0 = neutral, 100 = strong)
  // Compute actual max possible per dimension from question weights
  const dimMaxes = { E: 0, N: 0, F: 0, J: 0 };
  QUESTIONS.forEach(q => {
    Object.entries(q.scoring).forEach(([key, weight]) => {
      if (key === "mbti_E") dimMaxes.E += Math.abs(weight) * 2;
      if (key === "mbti_N") dimMaxes.N += Math.abs(weight) * 2;
      if (key === "mbti_F") dimMaxes.F += Math.abs(weight) * 2;
      if (key === "mbti_J") dimMaxes.J += Math.abs(weight) * 2;
    });
  });

  const preferences = {
    EI: { letter: E_I >= 0 ? "E" : "I", strength: Math.min(100, Math.round(Math.abs(E_I) / (dimMaxes.E || 1) * 100)) },
    NS: { letter: N_S >= 0 ? "N" : "S", strength: Math.min(100, Math.round(Math.abs(N_S) / (dimMaxes.N || 1) * 100)) },
    FT: { letter: F_T >= 0 ? "F" : "T", strength: Math.min(100, Math.round(Math.abs(F_T) / (dimMaxes.F || 1) * 100)) },
    JP: { letter: J_P >= 0 ? "J" : "P", strength: Math.min(100, Math.round(Math.abs(J_P) / (dimMaxes.J || 1) * 100)) }
  };

  const data = PERSONALITY_DATA.mbti[type];

  return {
    type: type,
    preferences: preferences,
    title: data ? data.title : type,
    description: data ? data.description : "",
    strengths: data ? data.strengths : [],
    weaknesses: data ? data.weaknesses : [],
    famousPeople: data ? data.famousPeople : [],
    atWork: data ? (data.atWork || "") : "",
    inRelationships: data ? (data.inRelationships || "") : "",
    underStress: data ? (data.underStress || "") : ""
  };
}

function calculateEnneagram(rawScores) {
  const types = [];
  for (let i = 1; i <= 9; i++) {
    types.push({ type: i, score: rawScores["enneagram_" + i] || 0 });
  }

  // Sort by score descending
  types.sort((a, b) => b.score - a.score);

  const primaryType = types[0].type;
  const primaryScore = types[0].score;

  // Wing is the adjacent type (primaryType +/- 1) with the higher score
  const wingCandidates = [
    primaryType === 1 ? 9 : primaryType - 1,
    primaryType === 9 ? 1 : primaryType + 1
  ];

  const wing1Score = rawScores["enneagram_" + wingCandidates[0]] || 0;
  const wing2Score = rawScores["enneagram_" + wingCandidates[1]] || 0;
  const wing = wing1Score >= wing2Score ? wingCandidates[0] : wingCandidates[1];

  const data = PERSONALITY_DATA.enneagram[primaryType];
  const wingKey = "wing" + primaryType + "w" + wing;

  return {
    type: primaryType,
    wing: wing,
    label: primaryType + "w" + wing,
    title: data ? data.title : "Type " + primaryType,
    description: data ? data.description : "",
    wingDescription: data ? (data[wingKey] || "") : "",
    strengths: data ? data.strengths : [],
    weaknesses: data ? data.weaknesses : [],
    famousPeople: data ? data.famousPeople : [],
    coreMotivation: data ? (data.coreMotivation || "") : "",
    coreFear: data ? (data.coreFear || "") : "",
    growthPath: data ? (data.growthPath || "") : "",
    allScores: types
  };
}

function calculateDISC(rawScores) {
  const styles = [
    { letter: "D", score: rawScores["disc_D"] || 0 },
    { letter: "I", score: rawScores["disc_I"] || 0 },
    { letter: "S", score: rawScores["disc_S"] || 0 },
    { letter: "C", score: rawScores["disc_C"] || 0 }
  ];

  // Sort by score descending
  styles.sort((a, b) => b.score - a.score);

  const primary = styles[0].letter;
  const secondary = styles[1].letter;
  const comboKey = primary + secondary;

  // Use combo if available, else primary only
  const comboData = PERSONALITY_DATA.disc[comboKey];
  const primaryData = PERSONALITY_DATA.disc[primary];

  const result = {
    primary: primary,
    secondary: secondary,
    combo: comboKey,
    title: comboData ? comboData.title : primaryData.title,
    description: comboData ? comboData.description : primaryData.description,
    strengths: comboData ? comboData.strengths : primaryData.strengths,
    weaknesses: comboData ? comboData.weaknesses : primaryData.weaknesses,
    allScores: {
      D: rawScores["disc_D"] || 0,
      I: rawScores["disc_I"] || 0,
      S: rawScores["disc_S"] || 0,
      C: rawScores["disc_C"] || 0
    }
  };

  return result;
}

function calculateBigFive(rawScores, questionCounts) {
  const traits = ["O", "C", "E", "A", "N"];
  const result = {};

  traits.forEach(trait => {
    const key = "ocean_" + trait;
    const raw = rawScores[key] || 0;
    const count = questionCounts[key] || 1;

    // Normalise to 0-100 percentage
    // Each question can contribute max ~4 points (centred score of 2 * weight of 2)
    // So max possible = count * 4, min possible = count * -4
    const maxPossible = count * 4;
    const percentage = Math.min(100, Math.max(0, Math.round(((raw + maxPossible) / (2 * maxPossible)) * 100)));

    const traitData = PERSONALITY_DATA.bigFive[trait];
    const isHigh = percentage >= 50;

    result[trait] = {
      name: traitData.name,
      percentage: percentage,
      label: isHigh ? traitData.high.label : traitData.low.label,
      description: isHigh ? traitData.high.description : traitData.low.description
    };
  });

  return result;
}

// ============================================================
// SUMMARY GENERATION — creative titles and combined descriptions
// ============================================================

/**
 * Generate a creative personality summary based on all 5 framework results.
 * @param {Object} results - The output of calculateResults()
 * @returns {Object} { title, description, traits }
 */
function generateSummary(results) {
  const { mbti, enneagram, disc, bigFive } = results;

  // Build a trait word bank based on results
  const traitBank = [];

  // MBTI-based traits
  const mbtiTraits = {
    INTJ: ["Strategic", "Independent"],
    INTP: ["Analytical", "Inventive"],
    ENTJ: ["Commanding", "Visionary"],
    ENTP: ["Quick-Witted", "Innovative"],
    INFJ: ["Insightful", "Idealistic"],
    INFP: ["Creative", "Authentic"],
    ENFJ: ["Inspirational", "Empathetic"],
    ENFP: ["Enthusiastic", "Free-Spirited"],
    ISTJ: ["Reliable", "Methodical"],
    ISFJ: ["Devoted", "Caring"],
    ESTJ: ["Organised", "Decisive"],
    ESFJ: ["Nurturing", "Social"],
    ISTP: ["Resourceful", "Cool-Headed"],
    ISFP: ["Artistic", "Gentle"],
    ESTP: ["Bold", "Action-Oriented"],
    ESFP: ["Vibrant", "Spontaneous"]
  };
  if (mbtiTraits[mbti.type]) {
    traitBank.push(...mbtiTraits[mbti.type]);
  }

  // Enneagram-based traits
  const enneagramTraits = {
    1: ["Principled", "Self-Disciplined"],
    2: ["Generous", "Warm-Hearted"],
    3: ["Ambitious", "Driven"],
    4: ["Emotionally Deep", "Original"],
    5: ["Perceptive", "Cerebral"],
    6: ["Loyal", "Vigilant"],
    7: ["Adventurous", "Optimistic"],
    8: ["Powerful", "Protective"],
    9: ["Peaceful", "Harmonious"]
  };
  if (enneagramTraits[enneagram.type]) {
    traitBank.push(...enneagramTraits[enneagram.type]);
  }

  // DISC-based trait
  const discTraitMap = { D: "Decisive", I: "Charismatic", S: "Steady", C: "Precise" };
  if (discTraitMap[disc.primary]) {
    traitBank.push(discTraitMap[disc.primary]);
  }

  // Big Five top traits
  if (bigFive.O.percentage >= 65) traitBank.push("Curious");
  if (bigFive.O.percentage <= 35) traitBank.push("Grounded");
  if (bigFive.C.percentage >= 65) traitBank.push("Disciplined");
  if (bigFive.C.percentage <= 35) traitBank.push("Flexible");
  if (bigFive.A.percentage >= 65) traitBank.push("Compassionate");
  if (bigFive.A.percentage <= 35) traitBank.push("Independent-Minded");
  if (bigFive.N.percentage >= 65) traitBank.push("Emotionally Attuned");
  if (bigFive.N.percentage <= 35) traitBank.push("Unshakeable");

  // Deduplicate
  const uniqueTraits = [...new Set(traitBank)];

  // --- Creative title generation ---
  const title = generateCreativeTitle(mbti, enneagram, disc, bigFive);

  // --- Description ---
  const description = generateDescription(mbti, enneagram, disc, bigFive);

  return {
    title: title,
    description: description,
    traits: uniqueTraits.slice(0, 8) // Top 8 traits
  };
}

function generateCreativeTitle(mbti, enneagram, disc, bigFive) {
  // Build title from archetype combinations
  const archetypeAdjectives = {
    // Based on MBTI + Enneagram combos
    "E_3": "The Spotlight Strategist",
    "E_7": "The Electric Adventurer",
    "E_8": "The Unstoppable Force",
    "E_2": "The Magnetic Heart",
    "E_1": "The Principled Dynamo",
    "I_4": "The Quiet Storm",
    "I_5": "The Deep Thinker",
    "I_9": "The Still Water",
    "I_6": "The Loyal Guardian",
    "I_1": "The Silent Perfectionist"
  };

  // Try specific MBTI+Enneagram combo first
  const eiKey = (mbti.type[0] === "E" ? "E" : "I") + "_" + enneagram.type;
  if (archetypeAdjectives[eiKey]) {
    return archetypeAdjectives[eiKey];
  }

  // Otherwise build from parts
  const prefixes = {
    INTJ: "The Quiet Architect",
    INTP: "The Hidden Genius",
    ENTJ: "The Bold Visionary",
    ENTP: "The Restless Inventor",
    INFJ: "The Gentle Prophet",
    INFP: "The Dreaming Soul",
    ENFJ: "The Radiant Leader",
    ENFP: "The Spark That Lights the Room",
    ISTJ: "The Unshakeable Pillar",
    ISFJ: "The Quiet Guardian",
    ESTJ: "The Iron Organiser",
    ESFJ: "The Warm Commander",
    ISTP: "The Cool Operator",
    ISFP: "The Gentle Rebel",
    ESTP: "The Lightning Rod",
    ESFP: "The Life of the Party"
  };

  let title = prefixes[mbti.type] || "The Unique One";

  // Add enneagram flavour for richer titles
  if (enneagram.type === 4 && !title.includes("Dream") && !title.includes("Soul")) {
    title = title.replace("The ", "The Deeply Feeling ");
  } else if (enneagram.type === 8 && !title.includes("Bold") && !title.includes("Iron")) {
    title = title.replace("The ", "The Fiercely ");
  } else if (enneagram.type === 2) {
    title += " with a Golden Heart";
  } else if (enneagram.type === 3 && !title.includes("Spotlight")) {
    title += " Who Never Stops";
  } else if (enneagram.type === 7 && !title.includes("Adventure") && !title.includes("Electric")) {
    title += " Who Chases the Horizon";
  }

  return title;
}

function generateDescription(mbti, enneagram, disc, bigFive) {
  const sentences = [];

  // Sentence 1: E/I energy style
  if (mbti.type[0] === "E") {
    sentences.push("You come alive around people and draw energy from connection.");
  } else {
    sentences.push("You think deeply and recharge in solitude.");
  }

  // Sentence 2: Enneagram core motivation
  const motivations = {
    1: "You want to do what's right and improve everything you touch.",
    2: "You earn love by loving fiercely first.",
    3: "You're driven to succeed and be recognised.",
    4: "You crave authenticity and meaning in everything.",
    5: "You need to understand the world before you engage with it.",
    6: "You're the loyal one who sticks around when everyone else leaves.",
    7: "You chase joy and possibility — life is your adventure.",
    8: "You protect what matters and lead with strength.",
    9: "You seek peace — within yourself and between the people you love."
  };
  sentences.push(motivations[enneagram.type] || "");

  // Sentence 3: DISC working style
  const discStyles = {
    D: "At work, you lead with decisiveness — you'd rather act fast and adjust than wait for perfect.",
    I: "At work, you bring the energy — you rally people and make things happen through enthusiasm.",
    S: "At work, you're the steady hand — reliable, patient, and the glue that holds teams together.",
    C: "At work, you bring precision — you set high standards and sweat the details others miss."
  };
  if (disc && disc.primary) {
    sentences.push(discStyles[disc.primary] || "");
  }

  // Sentence 4: Big Five highlight
  if (bigFive) {
    if (bigFive.O && bigFive.O.percentage >= 65) {
      sentences.push("Your curiosity and openness to new ideas set you apart.");
    } else if (bigFive.O && bigFive.O.percentage <= 35) {
      sentences.push("You're grounded in reality and trust what's proven to work.");
    } else if (bigFive.N && bigFive.N.percentage >= 65) {
      sentences.push("You feel things deeply — and that sensitivity is both your gift and your challenge.");
    } else if (bigFive.N && bigFive.N.percentage <= 35) {
      sentences.push("You're emotionally steady — the calm in everyone else's storm.");
    }
  }

  return sentences.filter(s => s.length > 0).join(" ");
}


// ============================================================
// MODULE EXPORT (works in both browser and Node.js)
// ============================================================

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    QUESTIONS,
    PERSONALITY_DATA,
    calculateResults,
    generateSummary
  };
}
