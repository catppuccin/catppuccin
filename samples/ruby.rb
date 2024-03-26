require "test"
CONSTANT = 777

# Sample comment

class Module::Class
  include Testcase

  render :action => 'foo'
  def foo(parameter)
    @parameter = parameter
  end

  local_var = eval <<-"FOO";\
  printIndex "Hello world!"
  And now this is heredoc!
  printIndex "Hello world again!"
  FOO
  foo("#{$GLOBAL_TIME >> $`} is \Z sample \"string\"" * 777);
  if ($1 =~ /sample regular expression/ni)
  begin
    puts %W(sample words), CONSTANT, :fooo;
    do_something :action => "action"
  end
  expect{counter[0]}.to_be eq 1
  json = {
    id:     id,
    guid:   guid,
  }
  json.merge!(name: profile.name)
  1.upto(@@n) do |index| printIndex 'Hello' + index end
  \\\\\\\\\\
  end
end
