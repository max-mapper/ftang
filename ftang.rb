
def music_dir;"music";end
def base_dir;"public/#{music_dir}";end

helpers do
  def partial(page, options={})
    haml page, options.merge!(:layout => false)
  end
end

configure do
  set :views, "#{File.dirname(__FILE__)}/views"
end

def get_cover(artist, album)
  path = Pow("#{base_dir}/#{artist}/#{album}")
  path.files.each do |file|
    if file.extention =~ /jpe?g|png/i
      return "/#{music_dir}/#{artist}/#{album}/#{file.name}"
    end
  end
  nil
end

get '/' do
  haml :base
end

get '/artists' do
  @artists = []
  path = Pow(base_dir)
  path.directories.each do |artist| 
    @artists << artist.name
  end
  @artists.sort!
  partial :artists, :locals => {:artists => @artists}
end

get %r{/play/([^/]+)(/)?} do
  pass unless params[:captures][1].nil?
  @artist = params[:captures][0]
  @albums = {}
  path = Pow("#{base_dir}/#{@artist}/")
  path.directories.each do |album|
    @cover = get_cover(@artist, album.name)
    if @cover
      @albums.merge!({"#{album.name}" => @cover})
    else
      @albums.merge!({"#{album.name}" => "missing"})
    end
  end
  @albums = @albums.sort{|a,b| a[1]<=>b[1]}
  partial :albums, :locals => {:artist => @artist, :albums => @albums, :cover => @cover}
end

get %r{/play/([^/]+)/([^/]+)?} do
  @artist = params[:captures][0]
  @album = params[:captures][1]
  path = Pow("#{base_dir}/#{@artist}/#{@album}/")
  @cover = get_cover(@artist, @album)
  partial :songs, :locals => {:artist => @artist, :album => @album, :cover => @cover}
end

get %r{/([^/]+)/([^/]+).json} do
  content_type :json
  @artist = params[:captures][0]
  @album = params[:captures][1]
  @songs = []
  path = Pow("#{base_dir}/#{@artist}/#{@album}/")
  path.files.each do |song|
    unless song.name =~ /.jpe?g|.png|.gif|.DS_Store/i
      @songs << {"name" => "#{CGI.unescape(song.name)}", "mp3" => "/#{music_dir}/#{@artist}/#{@album}/#{song.name}"}
    end
  end
  @songs = @songs.sort{|a,b| a["name"]<=>b["name"]}
  @songs.to_json
end

get '/allcovers' do
  @artists = []
  @covers = {}
  path = Pow("#{base_dir}")
  path.directories.each do |artist|
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

not_found do
  haml :"404"
end