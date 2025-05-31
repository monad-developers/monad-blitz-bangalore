import {
  Bot,
  History,
  Layers,
  MessagesSquareIcon,
  Sliders,
} from 'lucide-react';

export const features = [
  {
    title: 'Natural Language Blockchain Queries',
    description:
      'Ask questions like `What’s the ETH balance of 0x…` or `List recent NFT mints.`',
    icon: <MessagesSquareIcon />,
  },
  {
    title: 'Agent2Agent Support',
    description:
      "With ModAI user's and agents can also talk to different agent present on ModAI ",
    icon: <Layers />,
  },
  {
    title: 'Chatbot UI',
    description:
      'Familiar interface that feels like a modern AI chat assistant.',
    icon: <Bot />,
  },
  {
    title: 'Chat History Storage',
    description:
      'Your previous queries are saved securely — revisit or continue any conversation.',
    icon: <History />,
  },
  {
    title: 'Custom Chain Settings',
    description:
      'Customize your blockchain context and preferences with global state management.',
    icon: <Sliders />,
  },
];
