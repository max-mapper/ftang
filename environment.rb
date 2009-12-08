use Rack::Session::Cookie

MUSIC_DIR = "music"

configure do
  set :views, "#{File.dirname(__FILE__)}/views"
  set :sessions, true
  LOGGER = Logger.new("log/sinatra.log") 
end

helpers do
  def logger
    LOGGER
  end
  
  def base_dir;"public/#{MUSIC_DIR}";end
  
  def partial(page, options={})
    haml page, options.merge!(:layout => false)
  end
  
  def reset_session
    env['rack.session'] = {}
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