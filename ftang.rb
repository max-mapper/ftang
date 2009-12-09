
get '/' do
  session[:playlist] ||= []
  haml :base
end

get '/artists' do
  @artists = []
  Pow(base_dir).directories.each do |artist| 
    @artists << artist.name
  end
  @artists.sort!
  partial :artists, :locals => {:artists => @artists}
end

get %r{/play/([^/]+)} do
  capture :artist
  
  @albums_covers = {}
  Pow("#{base_dir}/#{@artist}/").directories.each do |album|
    cover = get_cover(@artist, album.name)
    cover ||= "missing"
    @albums_covers.merge!({"#{album.name}" => cover})
  end
  
  @albums_covers = @albums_covers.sort {|a,b| a[1]<=>b[1]}
  partial :albums, :locals => {:artist => @artist, :albums => @albums_covers}
end

get %r{/play/([^/]+)/([^/]+)} do
  capture :artist, :album
  @cover = get_cover(@artist, @album)
  partial :songs, :locals => {:artist => @artist, :cover => @cover}
end

get %r{/playlist/add/([^/]+)/([^/]+)} do
  capture :artist, :album
  p "artist: #{@artist}, album: #{@album}"
  @songs = []
  Pow("#{base_dir}/#{@artist}/#{@album}/").files.each do |song|
    unless song.name =~ NOT_A_SONG
      @songs << { 
        "name" => "#{CGI.unescape(song.name)}",
        "mp3" => "/#{MUSIC_DIR}/#{@artist}/#{@album}/#{song.name}"
      }
    end
  end
  @songs = @songs.sort{|a,b| a["name"]<=>b["name"]}
  @songs.each {|song| session[:playlist] << song}
  p "sweet beans"
end

get '/playlist/load' do
  content_type :json
  session[:playlist].to_json
end

get '/playlist/clear' do
  session[:playlist] = []
end

get '/session/clear' do
  reset_session
end

get '/allcovers' do
  @artists = []
  @covers = {}
  Pow(base_dir).directories.each do |artist|
    albums = []
    artist.directories.each do |album|
      cover = get_cover(artist.name, album.name)
      if cover
        albums << album.name
        @covers.merge!({album.name => cover})
      end
    end
    @artists << {"name" => artist.name, "albums" => albums} unless albums.empty?
  end
  haml :all
end
