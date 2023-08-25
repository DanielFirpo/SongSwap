import { useEffect, useState } from "react";
import { useExportPlaylistMutation, useGetRecommendationsQuery } from "../../../api";
import ExportPopup from "./ExportPopup";

function DiscoverPage() {
  const { data, error, isLoading } = useGetRecommendationsQuery();
  const [isExportPopupOpen, setIsExportPopupOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [createPlaylist] = useExportPlaylistMutation();

  useEffect(() => {
    console.log(data);
  }, [data]);

  if (error) return <>error</>;
  if (isLoading) return <>loading...</>;
  if (!data?.users[0]) return <>The site is still new... no one has signed up yet that has your taste in music ;(</>;

  return (
    <>
      {isExportPopupOpen && (
        <ExportPopup
          exportClickedCallback={async (e, includeCommonSongs, onlyExportPlaylistsWithCommonalities) => {
            
            //user clicked cancel button
            if (!e) {
              setIsExportPopupOpen(false);
            }
            
            const selectedUsersAsArray = Array.from(selectedUsers);
            const users = data.users.filter((user) => selectedUsersAsArray.includes(user.name));
            const songsToExport: string[] = [];

            users.forEach((user) => {
              for (let playlist of user.playlists) {
                if (onlyExportPlaylistsWithCommonalities) {
                  if (!playlist.songsInCommon.length) {
                    continue;
                  }
                }
                songsToExport.push(...playlist.newSongs.map((song) => song.spotifyId));
                if (includeCommonSongs) {
                  songsToExport.push(...playlist.songsInCommon.map((song) => song.spotifyId));
                }
              }
            });

            const maxNameLength = 50 - 3;
            let playlistName = "Song Exchange - " + selectedUsersAsArray.join(", ").substring(0, maxNameLength);
            if (playlistName.length >= maxNameLength) playlistName += "...";
            const playlistDescription =
              "A playlist auto-generated by SongExchange.online. Songs taken from these other users with similar taste: " +
              selectedUsersAsArray.join(", ");
            // let response = 
            await createPlaylist({ songs: songsToExport, playlistName, playlistDescription });
            //response format:
            // {
            //   "data": {
            //     "collaborative": false,
            //     "description": "A playlist auto-generated by SongExchange.online. Songs taken from other users with similar taste: trtld2",
            //     "external_urls": {
            //       "spotify": "https://open.spotify.com/playlist/3gorGgm4JYaiWoTvxLXjTn"
            //     },
            //     "followers": {
            //       "href": null,
            //       "total": 0
            //     },
            //     "href": "https://api.spotify.com/v1/playlists/3gorGgm4JYaiWoTvxLXjTn",
            //     "id": "3gorGgm4JYaiWoTvxLXjTn",
            //     "images": [],
            //     "name": "Song Exchange - trtld2...",
            //     "owner": {
            //       "display_name": "trtld",
            //       "external_urls": {
            //         "spotify": "https://open.spotify.com/user/trtld2"
            //       },
            //       "href": "https://api.spotify.com/v1/users/trtld2",
            //       "id": "trtld2",
            //       "type": "user",
            //       "uri": "spotify:user:trtld2"
            //     },
            //     "primary_color": null,
            //     "public": true,
            //     "snapshot_id": "MSxkNzhhYTY3YTliZTFkMWE2ZDVkZGM5NzQ4MGYwZTg2NjFiYjQ5MGEy",
            //     "tracks": {
            //       "href": "https://api.spotify.com/v1/playlists/3gorGgm4JYaiWoTvxLXjTn/tracks",
            //       "items": [],
            //       "limit": 100,
            //       "next": null,
            //       "offset": 0,
            //       "previous": null,
            //       "total": 0
            //     },
            //     "type": "playlist",
            //     "uri": "spotify:playlist:3gorGgm4JYaiWoTvxLXjTn"
            //   }
            // }
            setIsExportPopupOpen(false);
          }}
        />
      )}
      <h1>Your Musical Soulmate</h1> <h2>{data?.users[0].commonality}% common songs</h2>
      <h3>They share a lot of your favorite songs, so you'll probably enjoy the songs you don't have in common!</h3>
      <h3>
        {data?.users[0].name} with {data?.users[0].playlists.length} playlists and {data?.users[0].totalSongsInCommon}{" "}
        songs in common and {data?.users[0].totalSongsNotInCommon} new songs to discover!
        <button
          onClick={() => {
            setIsExportPopupOpen(true);
            setSelectedUsers(new Set([...selectedUsers, data?.users[0].name]));
          }}
        >
          Export
        </button>
      </h3>
      <h3>Other matches:</h3> ...
    </>
  );
}
export default DiscoverPage;
