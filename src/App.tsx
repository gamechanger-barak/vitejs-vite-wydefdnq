import { useRoute } from './lib/useRoute';
import CreatorApp from './components/creator/CreatorApp';
import PlayerView from './components/player/PlayerView';

export default function App() {
  const route = useRoute();

  if (route.name === 'player') {
    return <PlayerView gameId={route.gameId} />;
  }

  return <CreatorApp />;
}
