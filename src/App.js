import React from 'react';
import './style.css';
import ReactHlsPlayer from 'react-hls-player';
console.log('ReactHlsPlayer', ReactHlsPlayer);
export default function App() {
  const [myChannels, setMyChannels] = React.useState([]);
  const [selectedChannelIndex, setSelectedChannelIndex] = React.useState(null);
  React.useEffect(() => {
    function getChannels(chanelsString) {
      const channels = [];
      try {
        const lines = chanelsString.split('#EXTINF');
        for (let index = 0; index < lines.length; index++) {
          let line = lines[index];
          if (line.includes('http')) {
            const channel = {
              name: null,
              url: null,
            };
            channel.url = line
              .substring(line.indexOf('http'), line.length - 1)
              .trim();
            line = line.replace(channel.url, '');
            const copy = line;

            line = line.substring(0, line.indexOf('status'));
            line = line.replace(`:-1 tvg-id=`, '');
            line = line.replace(`"`, '');
            channel.name = line.replace(`"`, '').trim();
            if (!channel.name) channel.name = copy;
            channels.push(channel);
          }
        }
      } catch (error) {
        console.error(error);
      }
      return channels;
    }
    async function main() {
      const res = await fetch(
        'https://raw.githubusercontent.com/iptv-org/iptv/master/streams/az.m3u'
      ).then((response) => {
        const reader = response.body.getReader();
        return new ReadableStream({
          start(controller) {
            return pump();
            function pump() {
              return reader.read().then(({ done, value }) => {
                // When no more data needs to be consumed, close the stream
                if (done) {
                  controller.close();
                  return;
                }
                // Enqueue the next data chunk into our target stream
                const channels = getChannels(new TextDecoder().decode(value));
                setMyChannels(channels);
                controller.enqueue(value);
                return pump();
              });
            }
          },
        });
      });
    }
    main();
  }, []);
  return (
    <>
      <ul>
        {myChannels.map((channel, i) => {
          return (
            <li
              onClick={() => {
                setSelectedChannelIndex(i);
              }}
            >
              {channel.name}
            </li>
          );
        })}
      </ul>
      <ReactHlsPlayer
        src="https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8"
        hlsConfig={{
          maxLoadingDelay: 4,
          minAutoBitrate: 0,
          lowLatencyMode: true,
        }}
      />
    </>
  );
}
function MyPlayer({ channel }) {
  console.log(channel);
  // if (!channel) return <h1>Loading</h1>;
  return (
    <>
      <ReactHlsPlayer
        src={'http://85.132.81.184:8080/arb24/live1/index.m3u8'}
        hlsConfig={{
          maxLoadingDelay: 4,
          minAutoBitrate: 0,
          lowLatencyMode: true,
        }}
        autoPlay={false}
        controls={true}
        width="60%"
        height="auto"
      />
    </>
  );
}
