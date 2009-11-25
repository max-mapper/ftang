require '/home/maxo/.gems/gems/pow-0.2.2/lib/pow.rb'

@path = Pow("/home/maxo/DOESTHISMONKEYLOOKFUNNYTOYOU.COM/music")
@path.directories.each do |artist| 
  artist.directories.each do |album|
    album.files.each do |file|
      if file.extension =~ /(jpg|JPG|jpeg|JPEG)/
        puts "#{artist.name} / #{album.name} / #{file.name}"
      end
    end
  end
end