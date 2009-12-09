use Rack::Session::Cookie

MUSIC_DIR = "music"
NOT_A_SONG = /.jpe?g|.png|.gif|.DS_Store/i

configure do
  set :views, "#{File.dirname(__FILE__)}/views"
  set :sessions, true
  LOGGER = Logger.new("log/sinatra.log") 
end

helpers do
  def logger; LOGGER; end
  
  def base_dir;"public/#{MUSIC_DIR}";end
  
  def partial(page, options={})
    haml page, options.merge!(:layout => false)
  end
  
  def reset_session
    env['rack.session'] = {}
  end
  
  def get_cover(artist, album)
    Pow("#{base_dir}/#{artist}/#{album}").files.each do |file|
      if file.extention =~ /jpe?g|png/i
        return "/#{MUSIC_DIR}/#{artist}/#{album}/#{file.name}"
      end
    end
    nil
  end
  
  def capture(*args)
    args.each_with_index do |arg, i|
      instance_variable_set("@#{arg}".to_sym, params[:captures][i])
    end
  end
end

not_found do
  haml :"404"
end